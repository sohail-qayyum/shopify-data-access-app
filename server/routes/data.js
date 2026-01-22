import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyApiKey, requireScope, logApiUsage } from '../middleware/auth.js';
import ShopifyDataService from '../services/shopifyData.js';

const router = express.Router();

// Rate limiting for public API endpoints
const limiter = rateLimit({
    windowMs: parseInt(process.env.API_RATE_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.API_RATE_LIMIT) || 100,
    message: { error: 'Too many requests, please try again later' }
});

// Apply rate limiting and API key verification to all data routes
router.use(limiter);
router.use(verifyApiKey);
router.use(logApiUsage);

/**
 * Get orders data
 * GET /data/orders
 * 
 * Query parameters:
 * - limit: Number of orders to return (default: 50, max: 250)
 * - status: Order status (any, open, closed, cancelled)
 * - created_at_min: Filter orders created after this date (ISO 8601)
 * - created_at_max: Filter orders created before this date (ISO 8601)
 * - customer_id: Filter by customer ID
 */
router.get('/orders', requireScope('orders'), async (req, res) => {
    try {
        const filters = {
            limit: Math.min(parseInt(req.query.limit) || 50, 250),
            status: req.query.status,
            created_at_min: req.query.created_at_min,
            created_at_max: req.query.created_at_max,
            customer_id: req.query.customer_id
        };

        const dataService = new ShopifyDataService(req.shopifySession);
        const orders = await dataService.getOrders(filters);

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Orders endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders data'
        });
    }
});

/**
 * Get customers data
 * GET /data/customers
 * 
 * Query parameters:
 * - limit: Number of customers to return (default: 50, max: 250)
 * - created_at_min: Filter customers created after this date (ISO 8601)
 * - created_at_max: Filter customers created before this date (ISO 8601)
 * - email: Filter by email address
 */
router.get('/customers', requireScope('customers'), async (req, res) => {
    try {
        const filters = {
            limit: Math.min(parseInt(req.query.limit) || 50, 250),
            created_at_min: req.query.created_at_min,
            created_at_max: req.query.created_at_max,
            email: req.query.email
        };

        const dataService = new ShopifyDataService(req.shopifySession);
        const customers = await dataService.getCustomers(filters);

        res.json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        console.error('Customers endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch customers data'
        });
    }
});

/**
 * Get inventory data
 * GET /data/inventory
 * 
 * Query parameters:
 * - limit: Number of products to return (default: 50, max: 250)
 * - product_id: Filter by product ID
 * - vendor: Filter by vendor name
 */
router.get('/inventory', requireScope('inventory'), async (req, res) => {
    try {
        const filters = {
            limit: Math.min(parseInt(req.query.limit) || 50, 250),
            product_id: req.query.product_id,
            vendor: req.query.vendor
        };

        const dataService = new ShopifyDataService(req.shopifySession);
        const inventory = await dataService.getInventory(filters);

        res.json({
            success: true,
            count: inventory.length,
            data: inventory
        });
    } catch (error) {
        console.error('Inventory endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch inventory data'
        });
    }
});

export default router;
