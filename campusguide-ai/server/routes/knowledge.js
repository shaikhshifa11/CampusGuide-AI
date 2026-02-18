import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import RAGService from '../services/ragService.js';
import DocumentProcessor from '../rag/ingestion/documentProcessor.js';

const router = express.Router();
const ragService = new RAGService();
const documentProcessor = new DocumentProcessor();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const category = req.body.category || 'general';
        const uploadPath = path.join(process.cwd(), '..', 'knowledge', category);
        
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Sanitize filename
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
        cb(null, sanitized);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx', '.txt', '.md'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, TXT, and MD files are allowed.'));
        }
    }
});

/**
 * POST /api/knowledge/upload
 * Upload and process documents (admin only in production)
 */
router.post('/upload', upload.array('documents', 10), async (req, res) => {
    try {
        const files = req.files;
        const category = req.body.category || 'general';
        
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }
        
        console.log(`📤 Processing ${files.length} uploaded files...`);
        
        // Process each file
        const processedDocs = [];
        
        for (const file of files) {
            try {
                const doc = await documentProcessor.processFile(file.path, category);
                processedDocs.push(doc);
                console.log(`✅ Processed: ${file.originalname}`);
            } catch (error) {
                console.error(`❌ Failed to process ${file.originalname}:`, error);
            }
        }
        
        // Add to RAG system
        if (processedDocs.length > 0) {
            await ragService.addDocuments(processedDocs);
            console.log(`✅ Added ${processedDocs.length} documents to knowledge base`);
        }
        
        res.json({
            success: true,
            processed: processedDocs.length,
            total: files.length,
            message: `Successfully processed ${processedDocs.length} of ${files.length} documents`
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload documents'
        });
    }
});

/**
 * GET /api/knowledge/stats
 * Get knowledge base statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await ragService.getStats();
        
        res.json({
            success: true,
            totalDocuments: stats.documents || 0,
            totalChunks: stats.chunks || 0,
            lastUpdated: stats.lastUpdated || new Date().toLocaleDateString()
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve statistics'
        });
    }
});

/**
 * POST /api/knowledge/refresh
 * Trigger knowledge base refresh (admin only in production)
 */
router.post('/refresh', async (req, res) => {
    try {
        // In production, add authentication middleware here
        
        console.log('🔄 Refreshing knowledge base...');
        
        // This would trigger the ingestion process
        // For now, return success
        
        res.json({
            success: true,
            message: 'Knowledge base refresh initiated'
        });

    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh knowledge base'
        });
    }
});

export default router;
