import React, { useState, useEffect } from 'react';
import {
    Card,
    Text,
    BlockStack,
    Checkbox,
    Button,
    InlineStack
} from '@shopify/polaris';

function ScopeSelector({ scopes, onScopeChange }) {
    const [localScopes, setLocalScopes] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalScopes(scopes);
    }, [scopes]);

    const handleToggle = (scopeName) => {
        const updated = localScopes.map(scope =>
            scope.scopeName === scopeName
                ? { ...scope, enabled: !scope.enabled }
                : scope
        );
        setLocalScopes(updated);
        setHasChanges(true);
    };

    const handleSave = () => {
        onScopeChange(localScopes);
        setHasChanges(false);
    };

    const handleReset = () => {
        setLocalScopes(scopes);
        setHasChanges(false);
    };

    const getScopeDescription = (scopeName) => {
        const descriptions = {
            orders: 'Access order data including customer information, line items, pricing, and fulfillment status',
            customers: 'Access customer profiles, contact information, order history, and addresses',
            inventory: 'Access product information, SKUs, variants, stock levels, and availability'
        };
        return descriptions[scopeName] || '';
    };

    const getScopeIcon = (scopeName) => {
        const icons = {
            orders: '📦',
            customers: '👥',
            inventory: '📊'
        };
        return icons[scopeName] || '📄';
    };

    return (
        <Card>
            <BlockStack gap="400">
                <BlockStack gap="200">
                    <Text variant="headingMd" as="h2">
                        Data Scope Selection
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                        Choose which data you want to share through the API. You can change these settings at any time.
                    </Text>
                </BlockStack>

                <BlockStack gap="300">
                    {localScopes.map((scope) => (
                        <div
                            key={scope.scopeName}
                            style={{
                                padding: '16px',
                                border: '1px solid #e1e3e5',
                                borderRadius: '8px',
                                backgroundColor: scope.enabled ? '#f6f6f7' : 'white'
                            }}
                        >
                            <BlockStack gap="200">
                                <Checkbox
                                    label={
                                        <InlineStack gap="200" blockAlign="center">
                                            <span style={{ fontSize: '20px' }}>
                                                {getScopeIcon(scope.scopeName)}
                                            </span>
                                            <Text variant="headingSm" as="h3">
                                                {scope.scopeName.charAt(0).toUpperCase() + scope.scopeName.slice(1)}
                                            </Text>
                                        </InlineStack>
                                    }
                                    checked={scope.enabled}
                                    onChange={() => handleToggle(scope.scopeName)}
                                />
                                <Text variant="bodySm" as="p" tone="subdued">
                                    {getScopeDescription(scope.scopeName)}
                                </Text>
                            </BlockStack>
                        </div>
                    ))}
                </BlockStack>

                {hasChanges && (
                    <InlineStack gap="300">
                        <Button variant="primary" onClick={handleSave}>
                            Save Changes
                        </Button>
                        <Button onClick={handleReset}>
                            Reset
                        </Button>
                    </InlineStack>
                )}
            </BlockStack>
        </Card>
    );
}

export default ScopeSelector;
