import React, { useState, useEffect, useCallback } from 'react';
import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    InlineStack,
    Button,
    Banner,
    Spinner
} from '@shopify/polaris';
import ScopeSelector from '../components/ScopeSelector';
import ApiEndpoint from '../components/ApiEndpoint';
import ApiKeyManager from '../components/ApiKeyManager';
import axios from 'axios';

function Dashboard({ config }) {
    const [scopes, setScopes] = useState([]);
    const [apiKeys, setApiKeys] = useState([]);
    const [endpoints, setEndpoints] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Configure axios to include session ID and skip ngrok browser warning
    const axiosConfig = {
        headers: {
            'X-Shopify-Session-Id': config.session,
            'ngrok-skip-browser-warning': 'true'
        }
    };

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [scopesRes, keysRes, endpointsRes] = await Promise.all([
                axios.get('/api/scopes', axiosConfig),
                axios.get('/api/keys', axiosConfig),
                axios.get('/api/endpoint', axiosConfig)
            ]);

            setScopes(scopesRes.data.scopes);
            setApiKeys(keysRes.data.keys);
            setEndpoints(endpointsRes.data.endpoints);
        } catch (err) {
            console.error('Error fetching data:', err);

            // If we get a 401, the session is invalid. Re-authenticate.
            if (err.response?.status === 401) {
                console.error('Session invalid (401). Triggering top-level re-auth...');
                sessionStorage.removeItem('shopify_config');
                // Use absolute URL and top-level redirect to escape the iframe
                const authUrl = `${window.location.origin}/auth?shop=${config.shop}`;
                if (window.top !== window.self) {
                    window.top.location.href = authUrl;
                } else {
                    window.location.href = authUrl;
                }
                return;
            }

            setError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleScopeChange = useCallback(async (updatedScopes) => {
        try {
            setError(null);
            const response = await axios.put('/api/scopes',
                { scopes: updatedScopes },
                axiosConfig
            );
            setScopes(response.data.scopes);
            setSuccessMessage('Data scope settings saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error updating scopes:', err);
            setError('Failed to update data scopes. Please try again.');
        }
    }, [config]);

    const handleGenerateKey = useCallback(async (keyName) => {
        try {
            setError(null);
            const response = await axios.post('/api/keys',
                { name: keyName },
                axiosConfig
            );
            setApiKeys([...apiKeys, response.data.key]);
            setSuccessMessage('API key generated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
            return response.data.key;
        } catch (err) {
            console.error('Error generating API key:', err);
            setError('Failed to generate API key. Please try again.');
            throw err;
        }
    }, [apiKeys, config]);

    const handleRevokeKey = useCallback(async (keyId) => {
        try {
            setError(null);
            await axios.delete(`/api/keys/${keyId}`, axiosConfig);
            setApiKeys(apiKeys.map(key =>
                key.id === keyId ? { ...key, isActive: false } : key
            ));
            setSuccessMessage('API key revoked successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error revoking API key:', err);
            setError('Failed to revoke API key. Please try again.');
        }
    }, [apiKeys, config]);

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
            subtitle={`Connected to ${config.shop}`}
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
