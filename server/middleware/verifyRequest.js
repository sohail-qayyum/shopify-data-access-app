import shopify from '../config/shopify.js';

/**
 * Middleware to verify Shopify session tokens
 * This extracts and validates the session token from the Authorization header
 */
export default async function verifyRequest(req, res, next) {
    try {
        // Get the session token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.warn('No authorization header found');
            return res.status(401).json({ error: 'Unauthorized - No session token' });
        }

        // Extract the token (format: "Bearer <token>")
        const token = authHeader.replace('Bearer ', '');

        // Verify the session token using Shopify API
        const session = await shopify.session.decodeSessionToken(token);

        if (!session || !session.dest) {
            console.warn('Invalid session token');
            return res.status(401).json({ error: 'Unauthorized - Invalid session token' });
        }

        // Extract shop from the session
        // The dest field contains the shop URL like: https://shop-name.myshopify.com
        const shopUrl = new URL(session.dest);
        const shop = shopUrl.hostname;

        console.log('Session verified for shop:', shop);

        // Attach shop to request for use in route handlers
        req.shop = shop;
        req.sessionToken = session;

        next();
    } catch (error) {
        console.error('Session verification error:', error);
        return res.status(401).json({ error: 'Unauthorized - Session verification failed' });
    }
}
