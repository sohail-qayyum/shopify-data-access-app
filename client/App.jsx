import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import enTranslations from '@shopify/polaris/locales/en.json';
import Dashboard from './pages/Dashboard';

function App() {
    // Get shop and host from URL parameters
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');
    const host = params.get('host');

    console.log('=== App Bridge Initialization ===');
    console.log('Shop:', shop);
    console.log('Host:', host);
    console.log('API Key:', import.meta.env.VITE_SHOPIFY_API_KEY);
    console.log('================================');

    // If no shop parameter, show error
    if (!shop) {
        return (
            <AppProvider i18n={enTranslations}>
                <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <h1>⚠️ Missing Shop Parameter</h1>
                    <p>This app must be accessed through the Shopify admin or with a shop parameter.</p>
                    <p>Example: <code>?shop=yourstore.myshopify.com</code></p>
                </div>
            </AppProvider>
        );
    }

    // App Bridge configuration
    const appBridgeConfig = {
        apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
        host: host,
        forceRedirect: true
    };

    return (
        <AppBridgeProvider config={appBridgeConfig}>
            <AppProvider i18n={enTranslations}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Dashboard shop={shop} />} />
                    </Routes>
                </Router>
            </AppProvider>
        </AppBridgeProvider>
    );
}

export default App;
