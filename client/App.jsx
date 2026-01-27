import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import Dashboard from './pages/Dashboard';

function App() {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        // Get params from URL
        const params = new URLSearchParams(window.location.search);
        const shop = params.get('shop');
        const session = params.get('session');
        const host = params.get('host');

        console.log('App initialization - Shop:', shop, 'Session in URL:', !!session, 'Host:', !!host);

        // Check storage fallback
        let storedConfig = null;
        try {
            const stored = sessionStorage.getItem('shopify_config');
            if (stored) {
                storedConfig = JSON.parse(stored);
                console.log('Found stored config for shop:', storedConfig.shop);
            }
        } catch (e) {
            console.warn('Storage blocked');
        }

        if (shop && session) {
            console.log('Using session from URL');
            const newConfig = { shop, session, host };
            setConfig(newConfig);
            try {
                sessionStorage.setItem('shopify_config', JSON.stringify(newConfig));
            } catch (e) { }
        } else if (storedConfig && (!shop || storedConfig.shop === shop)) {
            console.log('Using session from storage');
            setConfig(storedConfig);
        } else if (shop) {
            console.log('No session found, redirecting to auth...');
            const authUrl = `/auth?shop=${shop}`;
            window.location.href = authUrl;
        } else {
            console.log('No shop or session found. Waiting...');
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
