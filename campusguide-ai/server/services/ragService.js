import SimpleVectorStore from '../rag/vectorstore/simpleVectorStore.js';
import EmbeddingService from './embeddingService.js';
import AIService from './aiService.js';

/**
 * RAG Service
 * Orchestrates Retrieval Augmented Generation
 */
class RAGService {
    constructor() {
        this.vectorStore = new SimpleVectorStore();
        this.embeddingService = new EmbeddingService();
        this.aiService = new AIService();
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            await this.vectorStore.initialize();
            this.initialized = true;
            console.log('✅ RAG Service initialized');
        }
    }

    async query(userMessage, conversationHistory = [], studentProfile = null) {
        await this.initialize();

        // Step 1: Generate embedding for user query
        const queryEmbedding = await this.embeddingService.generateEmbedding(userMessage);

        // Step 2: Retrieve relevant documents
        const topK = parseInt(process.env.TOP_K_RESULTS) || 3;
        const retrievedDocs = await this.vectorStore.search(queryEmbedding, topK);

        // Step 3: Format retrieved context
        const context = retrievedDocs
            .filter(doc => doc.similarity > 0.3) // Relevance threshold
            .map(doc => ({
                content: doc.document.content,
                category: doc.document.category,
                source: doc.document.source,
                similarity: doc.similarity
            }));

        console.log(`🔍 Retrieved ${context.length} relevant documents`);

        // Step 4: Build messages for AI
        const messages = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        // Step 5: Get AI response with RAG context
        const aiResponse = await this.aiService.chat(messages, context, studentProfile);

        return {
            response: aiResponse.content,
            retrievedDocuments: context.length,
            sources: context.map(c => ({ category: c.category, source: c.source })),
            model: aiResponse.model,
            provider: aiResponse.provider
        };
    }

    async addDocuments(documents) {
        await this.initialize();

        const docsToAdd = [];
        const embeddingsToAdd = [];

        for (const doc of documents) {
            for (const chunk of doc.chunks) {
                const embedding = await this.embeddingService.generateEmbedding(chunk);
                
                docsToAdd.push({
                    content: chunk,
                    category: doc.category,
                    source: doc.fileName,
                    metadata: doc.metadata
                });
                
                embeddingsToAdd.push(embedding);
            }
        }

        await this.vectorStore.addDocuments(docsToAdd, embeddingsToAdd);
        console.log(`✅ Added ${docsToAdd.length} document chunks to vector store`);

        return {
            added: docsToAdd.length,
            categories: [...new Set(docsToAdd.map(d => d.category))]
        };
    }

    async getStats() {
        await this.initialize();
        return this.vectorStore.getStats();
    }

    async clearKnowledge() {
        await this.initialize();
        await this.vectorStore.clear();
    }
}

export default RAGService;
