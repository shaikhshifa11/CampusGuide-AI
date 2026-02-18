import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple Vector Store Implementation
 * Uses cosine similarity for semantic search
 * Stores embeddings in JSON file
 */
class SimpleVectorStore {
    constructor(storePath = './vectorstore.json') {
        this.storePath = path.resolve(__dirname, storePath);
        this.documents = [];
        this.embeddings = [];
    }

    async initialize() {
        try {
            const data = await fs.readFile(this.storePath, 'utf-8');
            const store = JSON.parse(data);
            this.documents = store.documents || [];
            this.embeddings = store.embeddings || [];
            console.log(`✅ Loaded ${this.documents.length} documents from vector store`);
        } catch (error) {
            console.log('📦 Initializing new vector store');
            this.documents = [];
            this.embeddings = [];
        }
    }

    async addDocuments(docs, embeddings) {
        this.documents.push(...docs);
        this.embeddings.push(...embeddings);
        await this.save();
    }

    async save() {
        const store = {
            documents: this.documents,
            embeddings: this.embeddings,
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile(this.storePath, JSON.stringify(store, null, 2));
        console.log(`💾 Saved ${this.documents.length} documents to vector store`);
    }

    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    async search(queryEmbedding, topK = 3) {
        if (this.embeddings.length === 0) {
            return [];
        }

        const similarities = this.embeddings.map((embedding, index) => ({
            document: this.documents[index],
            similarity: this.cosineSimilarity(queryEmbedding, embedding),
            index
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, topK);
    }

    async clear() {
        this.documents = [];
        this.embeddings = [];
        await this.save();
        console.log('🗑️  Vector store cleared');
    }

    getStats() {
        return {
            totalDocuments: this.documents.length,
            categories: this.documents.reduce((acc, doc) => {
                acc[doc.category] = (acc[doc.category] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

export default SimpleVectorStore;
