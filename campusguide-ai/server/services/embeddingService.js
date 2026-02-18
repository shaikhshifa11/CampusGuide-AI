import natural from 'natural';

/**
 * Embedding Service
 * Generates vector embeddings for text
 * Uses TF-IDF for lightweight local embeddings
 */
class EmbeddingService {
    constructor() {
        this.tfidf = new natural.TfIdf();
        this.vocabulary = new Set();
        this.vectorSize = 300; // Standard embedding size
    }

    /**
 * Generate embedding for a single text
     */
    async generateEmbedding(text) {
        // Tokenize and clean
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(text.toLowerCase());
        
        // Create a simple embedding using word frequency
        const embedding = new Array(this.vectorSize).fill(0);
        
        tokens.forEach((token, index) => {
            // Simple hash-based embedding
            const hash = this.hashString(token);
            const position = Math.abs(hash) % this.vectorSize;
            embedding[position] += 1;
        });
        
        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    }

    /**
     * Generate embeddings for multiple texts
     */
    async generateEmbeddings(texts) {
        return Promise.all(texts.map(text => this.generateEmbedding(text)));
    }

    /**
     * Simple string hashing function
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    /**
     * Calculate semantic similarity between two texts
     */
    async calculateSimilarity(text1, text2) {
        const emb1 = await this.generateEmbedding(text1);
        const emb2 = await this.generateEmbedding(text2);
        
        const dotProduct = emb1.reduce((sum, val, i) => sum + val * emb2[i], 0);
        return dotProduct; // Already normalized
    }
}

export default EmbeddingService;
