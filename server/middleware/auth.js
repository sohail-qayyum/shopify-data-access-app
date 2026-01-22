import { PrismaClient } from '@prisma/client';
import shopify from '../config/shopify.js';

const prisma = new PrismaClient();

/**
 * Middleware to verify Shopify session for admin dashboard routes
 */
export const verifyShopifySession = async (req, res, next) => {
    try {
        const sessionId = req.headers['x-shopify-session-id'];

        if (!sessionId) {
            return res.status(401).json({ error: 'No session ID provided' });
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        // Attach session to request
        req.shopifySession = session;
        next();
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({ error: 'Session verification failed' });
    }
};

/**
 * Middleware to verify API key for public data endpoints
 */
export const verifyApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'] || req.query.api_key;

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: {
                session: {
                    include: {
                        dataScopes: true
                    }
                }
            }
        });

        if (!keyRecord || !keyRecord.isActive) {
            return res.status(401).json({ error: 'Invalid or inactive API key' });
        }

        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsedAt: new Date() }
        });

        // Attach API key and session to request
        req.apiKey = keyRecord;
        req.shopifySession = keyRecord.session;
        next();
    } catch (error) {
        console.error('API key verification error:', error);
        res.status(500).json({ error: 'API key verification failed' });
    }
};

/**
 * Middleware to check if a specific data scope is enabled
 */
export const requireScope = (scopeName) => {
    return async (req, res, next) => {
        try {
            const session = req.shopifySession;

            if (!session) {
                return res.status(401).json({ error: 'No session found' });
            }

            const scope = await prisma.dataScope.findUnique({
                where: {
                    sessionId_scopeName: {
                        sessionId: session.id,
                        scopeName: scopeName
                    }
                }
            });

            if (!scope || !scope.enabled) {
                return res.status(403).json({
                    error: `Access to ${scopeName} data is not enabled`
                });
            }

            next();
        } catch (error) {
            console.error('Scope verification error:', error);
            res.status(500).json({ error: 'Scope verification failed' });
        }
    };
};

/**
 * Middleware to log API usage
 */
export const logApiUsage = async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        // Log the request
        if (req.apiKey) {
            prisma.usageLog.create({
                data: {
                    apiKeyId: req.apiKey.id,
                    endpoint: req.path,
                    method: req.method,
                    statusCode: res.statusCode
                }
            }).catch(err => console.error('Failed to log API usage:', err));
        }

        originalSend.call(this, data);
    };

    next();
};

export default {
    verifyShopifySession,
    verifyApiKey,
    requireScope,
    logApiUsage
};
