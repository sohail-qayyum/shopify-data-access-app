import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import dataRoutes from './routes/data.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - Configure for Shopify embedding
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Shopify App Bridge
    frameguard: false, // Allow iframe embedding from Shopify
}));

// CORS configuration - Allow Shopify domains and custom headers
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests from Shopify admin and your app URL
        const allowedOrigins = [
            process.env.SHOPIFY_APP_URL,
            /https:\/\/.*\.myshopify\.com$/,
            /https:\/\/admin\.shopify\.com$/,
            /https:\/\/.*\.ngrok-free\.app$/,
            /https:\/\/.*\.ngrok\.io$/,
        ];

        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Check if origin matches any allowed pattern
        const isAllowed = allowedOrigins.some(pattern => {
            if (typeof pattern === 'string') return pattern === origin;
            return pattern.test(origin);
        });

        callback(null, isAllowed);
    },
    allowedHeaders: ['Content-Type', 'X-Shopify-Session-Id', 'ngrok-skip-browser-warning'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/', authRoutes);
app.use('/api', apiRoutes);
app.use('/data', dataRoutes);

// Serve static files from the dist directory (built React app)
app.use(express.static(path.join(__dirname, '../dist')));

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Shopify Data Access App running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 App URL: ${process.env.SHOPIFY_APP_URL || `http://localhost:${PORT}`}`);
});

export default app;
