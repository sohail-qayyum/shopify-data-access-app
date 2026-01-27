import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import Dashboard from './pages/Dashboard';

function App() {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        // Get shop and session from URL parameters
        const params = new URLSearchParams(window.location.search);
        const shop = params.get('shop');
        const session = params.get('session');

        // Check if we already have a valid session in storage
        const stored = sessionStorage.getItem('shopify_config');
        let storedConfig = null;
        if (stored) {
            storedConfig = JSON.parse(stored);
        }

        if (shop && session) {
            // New session from URL (e.g., after OAuth or fresh load)
            const newConfig = { shop, session };
            setConfig(newConfig);
            sessionStorage.setItem('shopify_config', JSON.stringify(newConfig));
        } else if (storedConfig && (!shop || storedConfig.shop === shop)) {
            // We have a stored session and it matches the current shop (or shop is implicit)
            setConfig(storedConfig);
        } else if (shop) {
            // No valid session found in URL or storage, need to re-authenticate
            const authUrl = `/auth?shop=${shop}`;
            window.location.href = authUrl;
        }
    }, []);

    if (!config) {
        return (
            <AppProvider i18n={enTranslations}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Loading...</h1>
                    <p>If you're not redirected, please install the app from your Shopify admin.</p>
                </div>
            </AppProvider>
        );
    }

    return (
        <AppProvider i18n={enTranslations}>
            <Router>
                <Routes>
                    <Route path="/" element={<Dashboard config={config} />} />
                </Routes>
            </Router>
        </AppProvider>
    );
}

export default App;
