import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import knowledgeRoutes from './routes/knowledge.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'CampusGuide AI',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            status: err.status || 500
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Endpoint not found',
            status: 404
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         🎓 CampusGuide AI - Backend Server           ║
║                                                       ║
║  Status: Running                                      ║
║  Port: ${PORT}                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                            ║
║  AI Provider: ${process.env.AI_PROVIDER || 'groq'}                                ║
║                                                       ║
║  Endpoints:                                           ║
║  • POST /api/chat                                     ║
║  • GET  /api/knowledge/stats                          ║
║  • GET  /health                                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});

export default app;
