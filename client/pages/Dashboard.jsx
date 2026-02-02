import React, { useState, useEffect, useCallback } from 'react';
import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    Banner,
    Spinner
} from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import ScopeSelector from '../components/ScopeSelector';
import ApiEndpoint from '../components/ApiEndpoint';
import ApiKeyManager from '../components/ApiKeyManager';

function Dashboard({ shop }) {
    const app = useAppBridge();
    const fetch = authenticatedFetch(app);

    const [scopes, setScopes] = useState([]);
    const [apiKeys, setApiKeys] = useState([]);
    const [endpoints, setEndpoints] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    console.log('Dashboard initialized for shop:', shop);

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching dashboard data...');

            const [scopesRes, keysRes, endpointsRes] = await Promise.all([
                fetch('/api/scopes').then(r => r.json()),
                fetch('/api/keys').then(r => r.json()),
                fetch('/api/endpoint').then(r => r.json())
            ]);

            console.log('Data fetched successfully');
            setScopes(scopesRes.scopes);
            setApiKeys(keysRes.keys);
            setEndpoints(endpointsRes.endpoints);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleScopeChange = useCallback(async (updatedScopes) => {
        try {
            setError(null);
            const response = await fetch('/api/scopes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scopes: updatedScopes })
            }).then(r => r.json());

            setScopes(response.scopes);
            setSuccessMessage('Data scope settings saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating scopes:', err);
            setError('Failed to update data scopes. Please try again.');
        }
    }, [fetch]);

    const handleGenerateKey = useCallback(async (keyName) => {
        try {
            setError(null);
            const response = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: keyName })
            }).then(r => r.json());

            setApiKeys([...apiKeys, response.key]);
            setSuccessMessage('API key generated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
            return response.key;
        } catch (err) {
            console.error('Error generating API key:', err);
            setError('Failed to generate API key. Please try again.');
            throw err;
        }
    }, [apiKeys, fetch]);

    const handleRevokeKey = useCallback(async (keyId) => {
        try {
            setError(null);
            await fetch(`/api/keys/${keyId}`, {
                method: 'DELETE'
            });

            setApiKeys(apiKeys.map(key =>
                key.id === keyId ? { ...key, isActive: false } : key
            ));
            setSuccessMessage('API key revoked successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error revoking API key:', err);
            setError('Failed to revoke API key. Please try again.');
        }
    }, [apiKeys, fetch]);

    if (loading) {
        return (
            <Page title="Data Access App">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Spinner size="large" />
                                <Text variant="bodyMd" as="p" tone="subdued">
                                    Loading dashboard...
                                </Text>
                            </div>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page
            title="Data Access App"
            subtitle={`Connected to ${shop}`}
        >
            <BlockStack gap="500">
                {error && (
                    <Banner tone="critical" onDismiss={() => setError(null)}>
                        <p>{error}</p>
                    </Banner>
                )}

                {successMessage && (
                    <Banner tone="success" onDismiss={() => setSuccessMessage(null)}>
                        <p>{successMessage}</p>
                    </Banner>
                )}

                <Layout>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">
                                    Welcome to Data Access App
                                </Text>
                                <Text variant="bodyMd" as="p" tone="subdued">
                                    This app allows you to securely share your store's data through API endpoints.
                                    Select which data you want to share, generate an API key, and use the endpoints
                                    to integrate with your custom dashboard or other applications.
                                </Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    <Layout.Section>
                        <ScopeSelector
                            scopes={scopes}
                            onScopeChange={handleScopeChange}
                        />
                    </Layout.Section>

                    <Layout.Section>
                        <ApiKeyManager
                            apiKeys={apiKeys}
                            onGenerateKey={handleGenerateKey}
                            onRevokeKey={handleRevokeKey}
                        />
                    </Layout.Section>

                    <Layout.Section>
                        <ApiEndpoint
                            endpoints={endpoints}
                            scopes={scopes}
                        />
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
}

export default Dashboard;
