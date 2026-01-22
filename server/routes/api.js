import express from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { verifyShopifySession } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get current data scope configuration
 * GET /api/scopes
 */
router.get('/scopes', verifyShopifySession, async (req, res) => {
    try {
        const scopes = await prisma.dataScope.findMany({
            where: { sessionId: req.shopifySession.id }
        });

        res.json({ scopes });
    } catch (error) {
        console.error('Error fetching scopes:', error);
        res.status(500).json({ error: 'Failed to fetch scopes' });
    }
});

/**
 * Update data scope configuration
 * PUT /api/scopes
 */
router.put('/scopes', verifyShopifySession, async (req, res) => {
    try {
        const { scopes } = req.body; // Array of { scopeName, enabled }

        if (!Array.isArray(scopes)) {
            return res.status(400).json({ error: 'Scopes must be an array' });
        }

        // Update each scope
        const updatePromises = scopes.map(scope =>
            prisma.dataScope.upsert({
                where: {
                    sessionId_scopeName: {
                        sessionId: req.shopifySession.id,
                        scopeName: scope.scopeName
                    }
                },
                update: { enabled: scope.enabled },
                create: {
                    sessionId: req.shopifySession.id,
                    scopeName: scope.scopeName,
                    enabled: scope.enabled
                }
            })
        );

        await Promise.all(updatePromises);

        const updatedScopes = await prisma.dataScope.findMany({
            where: { sessionId: req.shopifySession.id }
        });

        res.json({ scopes: updatedScopes });
    } catch (error) {
        console.error('Error updating scopes:', error);
        res.status(500).json({ error: 'Failed to update scopes' });
    }
});

/**
 * Get all API keys for the current session
 * GET /api/keys
 */
router.get('/keys', verifyShopifySession, async (req, res) => {
    try {
        const keys = await prisma.apiKey.findMany({
            where: { sessionId: req.shopifySession.id },
            select: {
                id: true,
                name: true,
                key: true,
                isActive: true,
                lastUsedAt: true,
                createdAt: true
            }
        });

        res.json({ keys });
    } catch (error) {
        console.error('Error fetching API keys:', error);
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

/**
 * Generate a new API key
 * POST /api/keys
 */
router.post('/keys', verifyShopifySession, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Key name required' });
        }

        // Generate a secure random API key
        const apiKey = `sdk_${uuidv4().replace(/-/g, '')}`;

        const newKey = await prisma.apiKey.create({
            data: {
                sessionId: req.shopifySession.id,
                key: apiKey,
                name: name,
                isActive: true
            }
        });

        res.json({ key: newKey });
    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({ error: 'Failed to create API key' });
    }
});

/**
 * Revoke an API key
 * DELETE /api/keys/:keyId
 */
router.delete('/keys/:keyId', verifyShopifySession, async (req, res) => {
    try {
        const { keyId } = req.params;

        // Verify the key belongs to this session
        const key = await prisma.apiKey.findFirst({
            where: {
                id: keyId,
                sessionId: req.shopifySession.id
            }
        });

        if (!key) {
            return res.status(404).json({ error: 'API key not found' });
        }

        await prisma.apiKey.update({
            where: { id: keyId },
            data: { isActive: false }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error revoking API key:', error);
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
});

/**
 * Get API endpoint URL
 * GET /api/endpoint
 */
router.get('/endpoint', verifyShopifySession, async (req, res) => {
    try {
        const baseUrl = process.env.SHOPIFY_APP_URL || 'http://localhost:3000';

        res.json({
            endpoints: {
                orders: `${baseUrl}/data/orders`,
                customers: `${baseUrl}/data/customers`,
                inventory: `${baseUrl}/data/inventory`
            },
            documentation: `${baseUrl}/docs`
        });
    } catch (error) {
        console.error('Error fetching endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch endpoint' });
    }
});

export default router;
