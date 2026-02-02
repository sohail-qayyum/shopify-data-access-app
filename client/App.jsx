import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import Dashboard from './pages/Dashboard';

function App() {
    const [config, setConfig] = useState(null);
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [debugInfo, setDebugInfo] = useState({});

    useEffect(() => {
        // Set a timeout to show debug info if loading takes too long
        const timeoutId = setTimeout(() => {
            setLoadingTimeout(true);
        }, 5000);

        // Get params from URL
        const params = new URLSearchParams(window.location.search);
        const shop = params.get('shop');
        const session = params.get('session');
        const host = params.get('host');
        const embedded = params.get('embedded');

        // Log all URL parameters for debugging
        const allParams = {};
        params.forEach((value, key) => {
            allParams[key] = value;
        });

        console.log('=== App Initialization Debug ===');
        console.log('Full URL:', window.location.href);
        console.log('All URL params:', allParams);
        console.log('Shop:', shop);
        console.log('Session in URL:', !!session);
        console.log('Host:', host);
        console.log('Embedded:', embedded);
        console.log('Is in iframe:', window.top !== window.self);
        console.log('================================');

        setDebugInfo({
            url: window.location.href,
            shop,
            hasSession: !!session,
            host,
            embedded,
            isIframe: window.top !== window.self,
            allParams
        });

        // Check storage fallback
        let storedConfig = null;
        try {
            const stored = sessionStorage.getItem('shopify_config');
            if (stored) {
                storedConfig = JSON.parse(stored);
                console.log('Found stored config for shop:', storedConfig.shop);
            }
        } catch (e) {
            console.warn('Storage blocked:', e);
        }

        if (shop && session) {
            console.log('✓ Using session from URL');
            const newConfig = { shop, session, host };
            setConfig(newConfig);
            clearTimeout(timeoutId);
            try {
                sessionStorage.setItem('shopify_config', JSON.stringify(newConfig));
            } catch (e) {
                console.warn('Could not save to sessionStorage:', e);
            }
        } else if (storedConfig && (!shop || storedConfig.shop === shop)) {
            console.log('✓ Using session from storage');
            setConfig(storedConfig);
            clearTimeout(timeoutId);
        } else if (shop) {
            console.log('⚠ No session found, redirecting to auth...');
            clearTimeout(timeoutId);
            // Use absolute URL and top-level redirect to escape the iframe
            const authUrl = `${window.location.origin}/auth?shop=${shop}`;
            console.log('Redirecting to:', authUrl);
            if (window.top !== window.self) {
                window.top.location.href = authUrl;
            } else {
                window.location.href = authUrl;
            }
        } else {
            console.log('⚠ No shop or session found. Waiting...');
        }

        return () => clearTimeout(timeoutId);
    }, []);

    if (!config) {
        return (
            <AppProvider i18n={enTranslations}>
                <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <h1>Loading...</h1>
                    <p>If you're not redirected, please install the app from your Shopify admin.</p>

                    {loadingTimeout && (
                        <div style={{
                            marginTop: '30px',
                            padding: '20px',
                            backgroundColor: '#fff4e6',
                            border: '1px solid #ffa500',
                            borderRadius: '8px',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ color: '#ff8c00', marginTop: 0 }}>⚠️ Loading Issue Detected</h3>
                            <p><strong>The app is taking longer than expected to load.</strong></p>

                            <h4>Debug Information:</h4>
                            <pre style={{
                                backgroundColor: '#f5f5f5',
                                padding: '10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                overflow: 'auto'
                            }}>
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>

                            <h4>Possible Solutions:</h4>
                            <ol style={{ textAlign: 'left', lineHeight: '1.8' }}>
                                <li>Try opening the app directly: <a href={window.location.origin} target="_blank">{window.location.origin}</a></li>
                                <li>Reinstall the app from your Shopify admin</li>
                                <li>Clear your browser cache and cookies</li>
                                <li>Check the browser console for errors (F12)</li>
                            </ol>
                        </div>
                    )}
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
