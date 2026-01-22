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

        if (shop && session) {
            setConfig({ shop, session });
            // Store in sessionStorage for persistence
            sessionStorage.setItem('shopify_config', JSON.stringify({ shop, session }));
        } else {
            // Try to load from sessionStorage
            const stored = sessionStorage.getItem('shopify_config');
            if (stored) {
                setConfig(JSON.parse(stored));
            }
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
