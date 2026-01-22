import React from 'react';
import {
    Card,
    Text,
    BlockStack,
    InlineStack,
    Button,
    Badge,
    Divider
} from '@shopify/polaris';
import { ClipboardIcon } from '@shopify/polaris-icons';

function ApiEndpoint({ endpoints, scopes }) {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const isScopeEnabled = (scopeName) => {
        const scope = scopes.find(s => s.scopeName === scopeName);
        return scope?.enabled || false;
    };

    const getEndpointExample = (scopeName, url) => {
        const examples = {
            orders: `${url}?limit=50&status=open&created_at_min=2024-01-01`,
            customers: `${url}?limit=50&email=customer@example.com`,
            inventory: `${url}?limit=50&vendor=YourBrand`
        };
        return examples[scopeName] || url;
    };

    const getQueryParams = (scopeName) => {
        const params = {
            orders: [
                { name: 'limit', description: 'Number of orders (max 250)' },
                { name: 'status', description: 'any, open, closed, cancelled' },
                { name: 'created_at_min', description: 'ISO 8601 date' },
                { name: 'created_at_max', description: 'ISO 8601 date' },
                { name: 'customer_id', description: 'Filter by customer ID' }
            ],
            customers: [
                { name: 'limit', description: 'Number of customers (max 250)' },
                { name: 'created_at_min', description: 'ISO 8601 date' },
                { name: 'created_at_max', description: 'ISO 8601 date' },
                { name: 'email', description: 'Filter by email address' }
            ],
            inventory: [
                { name: 'limit', description: 'Number of products (max 250)' },
                { name: 'product_id', description: 'Filter by product ID' },
                { name: 'vendor', description: 'Filter by vendor name' }
            ]
        };
        return params[scopeName] || [];
    };

    const renderEndpointCard = (scopeName, url) => {
        const enabled = isScopeEnabled(scopeName);
        const queryParams = getQueryParams(scopeName);

        return (
            <div
                key={scopeName}
                style={{
                    padding: '16px',
                    border: '1px solid #e1e3e5',
                    borderRadius: '8px',
                    backgroundColor: enabled ? 'white' : '#f6f6f7',
                    opacity: enabled ? 1 : 0.6
                }}
            >
                <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingSm" as="h3">
                            {scopeName.charAt(0).toUpperCase() + scopeName.slice(1)} Endpoint
                        </Text>
                        {enabled ? (
                            <Badge tone="success">Enabled</Badge>
                        ) : (
                            <Badge tone="warning">Disabled</Badge>
                        )}
                    </InlineStack>

                    {enabled ? (
                        <>
                            <div
                                style={{
                                    padding: '12px',
                                    backgroundColor: '#f6f6f7',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {url}
                            </div>

                            <InlineStack gap="200">
                                <Button
                                    size="slim"
                                    icon={ClipboardIcon}
                                    onClick={() => copyToClipboard(url)}
                                >
                                    Copy URL
                                </Button>
                                <Button
                                    size="slim"
                                    variant="plain"
                                    onClick={() => copyToClipboard(getEndpointExample(scopeName, url))}
                                >
                                    Copy Example
                                </Button>
                            </InlineStack>

                            <Divider />

                            <BlockStack gap="200">
                                <Text variant="bodySm" as="p" fontWeight="semibold">
                                    Available Query Parameters:
                                </Text>
                                {queryParams.map((param) => (
                                    <div key={param.name} style={{ paddingLeft: '12px' }}>
                                        <Text variant="bodySm" as="p">
                                            <code style={{
                                                backgroundColor: '#f6f6f7',
                                                padding: '2px 6px',
                                                borderRadius: '3px',
                                                fontFamily: 'monospace'
                                            }}>
                                                {param.name}
                                            </code>
                                            {' - '}
                                            <span style={{ color: '#6d7175' }}>{param.description}</span>
                                        </Text>
                                    </div>
                                ))}
                            </BlockStack>

                            <BlockStack gap="200">
                                <Text variant="bodySm" as="p" fontWeight="semibold">
                                    Authentication:
                                </Text>
                                <Text variant="bodySm" as="p" tone="subdued">
                                    Include your API key in the request header: <code>X-API-Key: your_api_key</code>
                                </Text>
                            </BlockStack>
                        </>
                    ) : (
                        <Text variant="bodySm" as="p" tone="subdued">
                            Enable this data scope above to access this endpoint
                        </Text>
                    )}
                </BlockStack>
            </div>
        );
    };

    return (
        <Card>
            <BlockStack gap="400">
                <BlockStack gap="200">
                    <Text variant="headingMd" as="h2">
                        API Endpoints
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                        Use these endpoints to access your store data. Make sure to include your API key in the request headers.
                    </Text>
                </BlockStack>

                <BlockStack gap="300">
                    {Object.entries(endpoints).map(([scopeName, url]) =>
                        renderEndpointCard(scopeName, url)
                    )}
                </BlockStack>

                <div
                    style={{
                        padding: '16px',
                        backgroundColor: '#fff4e6',
                        borderRadius: '8px',
                        border: '1px solid #ffd580'
                    }}
                >
                    <BlockStack gap="200">
                        <Text variant="bodySm" as="p" fontWeight="semibold">
                            📚 Need more help?
                        </Text>
                        <Text variant="bodySm" as="p">
                            Check out the full API documentation for detailed information on request/response formats,
                            error handling, and advanced filtering options.
                        </Text>
                    </BlockStack>
                </div>
            </BlockStack>
        </Card>
    );
}

export default ApiEndpoint;
