import React, { useState } from 'react';
import {
    Card,
    Text,
    BlockStack,
    InlineStack,
    Button,
    TextField,
    DataTable,
    Badge,
    Modal,
    Icon
} from '@shopify/polaris';
import { ClipboardIcon } from '@shopify/polaris-icons';

function ApiKeyManager({ apiKeys, onGenerateKey, onRevokeKey }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [keyName, setKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateClick = () => {
        setIsModalOpen(true);
        setKeyName('');
        setGeneratedKey(null);
    };

    const handleGenerate = async () => {
        if (!keyName.trim()) return;

        try {
            setIsGenerating(true);
            const newKey = await onGenerateKey(keyName);
            setGeneratedKey(newKey);
            setKeyName('');
        } catch (error) {
            console.error('Failed to generate key:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setGeneratedKey(null);
        setKeyName('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    const rows = apiKeys.map((key) => [
        key.name,
        <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {key.key.substring(0, 20)}...
            <Button
                variant="plain"
                icon={ClipboardIcon}
                onClick={() => copyToClipboard(key.key)}
                accessibilityLabel="Copy API key"
            />
        </div>,
        key.isActive ? (
            <Badge tone="success">Active</Badge>
        ) : (
            <Badge tone="critical">Revoked</Badge>
        ),
        formatDate(key.lastUsedAt),
        formatDate(key.createdAt),
        key.isActive ? (
            <Button
                variant="plain"
                tone="critical"
                onClick={() => onRevokeKey(key.id)}
            >
                Revoke
            </Button>
        ) : null
    ]);

    return (
        <>
            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="200">
                            <Text variant="headingMd" as="h2">
                                API Keys
                            </Text>
                            <Text variant="bodyMd" as="p" tone="subdued">
                                Generate and manage API keys for accessing your data endpoints
                            </Text>
                        </BlockStack>
                        <Button variant="primary" onClick={handleGenerateClick}>
                            Generate New Key
                        </Button>
                    </InlineStack>

                    {apiKeys.length > 0 ? (
                        <DataTable
                            columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                            headings={['Name', 'Key', 'Status', 'Last Used', 'Created', 'Actions']}
                            rows={rows}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text variant="bodyMd" as="p" tone="subdued">
                                No API keys generated yet. Create your first key to start accessing the API.
                            </Text>
                        </div>
                    )}
                </BlockStack>
            </Card>

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title={generatedKey ? 'API Key Generated' : 'Generate New API Key'}
                primaryAction={
                    generatedKey
                        ? {
                            content: 'Done',
                            onAction: handleCloseModal
                        }
                        : {
                            content: 'Generate',
                            onAction: handleGenerate,
                            loading: isGenerating,
                            disabled: !keyName.trim()
                        }
                }
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleCloseModal
                    }
                ]}
            >
                <Modal.Section>
                    {generatedKey ? (
                        <BlockStack gap="400">
                            <Text variant="bodyMd" as="p">
                                Your API key has been generated. Copy it now as you won't be able to see it again.
                            </Text>
                            <div
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#f6f6f7',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {generatedKey.key}
                            </div>
                            <Button
                                variant="primary"
                                icon={ClipboardIcon}
                                onClick={() => copyToClipboard(generatedKey.key)}
                            >
                                Copy to Clipboard
                            </Button>
                        </BlockStack>
                    ) : (
                        <BlockStack gap="400">
                            <Text variant="bodyMd" as="p">
                                Give your API key a descriptive name to help you remember what it's used for.
                            </Text>
                            <TextField
                                label="Key Name"
                                value={keyName}
                                onChange={setKeyName}
                                placeholder="e.g., Production Dashboard"
                                autoComplete="off"
                            />
                        </BlockStack>
                    )}
                </Modal.Section>
            </Modal>
        </>
    );
}

export default ApiKeyManager;
