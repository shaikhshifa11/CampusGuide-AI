import express from 'express';
import RAGService from '../services/ragService.js';

const router = express.Router();
const ragService = new RAGService();

/**
 * POST /api/chat
 * Main chat endpoint with RAG
 */
router.post('/', async (req, res) => {
    try {
        const { message, conversationHistory, studentProfile } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required and must be a string'
            });
        }

        console.log(`💬 Chat request: "${message.substring(0, 50)}..."`);

        const result = await ragService.query(
            message,
            conversationHistory || [],
            studentProfile || null
        );

        res.json({
            success: true,
            response: result.response,
            metadata: {
                retrievedDocuments: result.retrievedDocuments,
                sources: result.sources,
                model: result.model,
                provider: result.provider,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process chat request'
        });
    }
});

/**
 * POST /api/chat/feedback
 * Collect user feedback on responses
 */
router.post('/feedback', async (req, res) => {
    try {
        const { messageId, rating, comment } = req.body;

        // In production, save to database
        console.log('📊 Feedback received:', { messageId, rating, comment });

        res.json({
            success: true,
            message: 'Feedback recorded'
        });

    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record feedback'
        });
    }
});

export default router;
