import path from 'path';
import { fileURLToPath } from 'url';
import DocumentProcessor from './documentProcessor.js';
import RAGService from '../../services/ragService.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Knowledge Base Ingestion Script
 * Processes all documents in knowledge folder and adds to vector store
 */
async function ingestKnowledge() {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     📚 CampusGuide AI - Knowledge Ingestion          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    const processor = new DocumentProcessor();
    const ragService = new RAGService();
    await ragService.initialize();

    const knowledgeBasePath = path.resolve(__dirname, '../../../knowledge');
    
    const categories = [
        'policies',
        'notices',
        'academic-calendar',
        'fees',
        'hostel',
        'faq'
    ];

    let totalDocuments = 0;
    let totalChunks = 0;

    for (const category of categories) {
        console.log(`\n📂 Processing category: ${category}`);
        const categoryPath = path.join(knowledgeBasePath, category);
        
        try {
            const documents = await processor.processDirectory(categoryPath, category);
            
            if (documents.length > 0) {
                const result = await ragService.addDocuments(documents);
                totalDocuments += documents.length;
                totalChunks += result.added;
                console.log(`   ✅ Added ${documents.length} documents (${result.added} chunks)`);
            } else {
                console.log(`   ⚠️  No documents found`);
            }
        } catch (error) {
            console.error(`   ❌ Error processing ${category}:`, error.message);
        }
    }

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  ✅ Ingestion Complete                                ║
║                                                       ║
║  Documents processed: ${totalDocuments.toString().padEnd(30)}║
║  Chunks created: ${totalChunks.toString().padEnd(35)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    const stats = await ragService.getStats();
    console.log('\n📊 Vector Store Statistics:');
    console.log(JSON.stringify(stats, null, 2));
}

// Run ingestion
ingestKnowledge().catch(error => {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
});
