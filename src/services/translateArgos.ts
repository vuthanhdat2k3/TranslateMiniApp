import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

export interface TranslateOptions {
    text: string;
    sourceLanguage: string; // "en", "vi", etc.
    targetLanguage: string;
}

// Local Argos Translate server URL
// Start the server with: cd argos-server && python server.py
const ARGOS_SERVER_URL = import.meta.env.VITE_ARGOS_SERVER_URL || 'http://127.0.0.1:5100/translate';

// Check if running inside Tauri
const isTauri = (): boolean => {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Use Tauri fetch when in Tauri, otherwise fallback to browser fetch
const fetchWithFallback = async (url: string, options: RequestInit): Promise<Response> => {
    if (isTauri()) {
        return tauriFetch(url, options);
    }
    return fetch(url, options);
};

export async function translateTextArgos({ text, sourceLanguage, targetLanguage }: TranslateOptions): Promise<string> {
    // Argos Translate uses simple 2-letter codes (en, vi, zh) NOT (en-US, vi-VN)
    const source = sourceLanguage.split('-')[0];
    const target = targetLanguage.split('-')[0];

    try {
        const response = await fetchWithFallback(ARGOS_SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: source,
                target: target,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Argos Translate API Error:', response.status, errorText);
            throw new Error(`Argos Translate Error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data.translatedText;
    } catch (error: any) {
        console.error('Argos Translate Request Failed:', error.message);

        // Check if it's a connection error (server not running)
        if (error.message?.includes('fetch') || error.message?.includes('connect')) {
            throw new Error('Argos server not running. Start it with: cd argos-server && python server.py');
        }

        throw new Error(`Argos Translate failed: ${error.message}`);
    }
}
