import express from 'express';
import { PrismaClient } from '@prisma/client';
import shopify from '../config/shopify.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Initiate OAuth flow
 * GET /auth?shop=store-name.myshopify.com
 */
router.get('/auth', async (req, res) => {
    try {
        const { shop } = req.query;

        if (!shop) {
            return res.status(400).json({ error: 'Shop parameter required' });
        }

        // Generate authorization URL
        const authRoute = await shopify.auth.begin({
            shop: shopify.utils.sanitizeShop(shop, true),
            callbackPath: '/auth/callback',
            isOnline: false,
        });

        res.redirect(authRoute);
    } catch (error) {
        console.error('Auth initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate authentication' });
    }
});

/**
 * OAuth callback handler
 * GET /auth/callback
 */
router.get('/auth/callback', async (req, res) => {
    try {
        const callbackResponse = await shopify.auth.callback({
            rawRequest: req,
            rawResponse: res,
        });

        const { session } = callbackResponse;

        // Store session in database
        const storedSession = await prisma.session.upsert({
            where: { shop: session.shop },
            update: {
                accessToken: session.accessToken,
                scope: session.scope,
                isOnline: session.isOnline,
                updatedAt: new Date()
            },
            create: {
                shop: session.shop,
                accessToken: session.accessToken,
                scope: session.scope,
                isOnline: session.isOnline
            }
        });

        // Initialize default data scopes (all disabled)
        const scopeNames = ['orders', 'customers', 'inventory'];
        for (const scopeName of scopeNames) {
            await prisma.dataScope.upsert({
                where: {
                    sessionId_scopeName: {
                        sessionId: storedSession.id,
                        scopeName: scopeName
                    }
                },
                update: {},
                create: {
                    sessionId: storedSession.id,
                    scopeName: scopeName,
                    enabled: false
                }
            });
        }

        // Redirect to app dashboard with session ID
        const redirectUrl = `/?shop=${session.shop}&session=${storedSession.id}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Auth callback error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

/**
 * Verify session is still valid
 * GET /auth/verify
 */
router.get('/auth/verify', async (req, res) => {
    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        res.json({ valid: true, shop: session.shop });
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

export default router;
