const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface TranslateOptions {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
}

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
    error?: {
        message: string;
    };
}

export const translateText = async ({
    text,
    sourceLanguage,
    targetLanguage,
}: TranslateOptions): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('API key not configured. Please set VITE_OPENROUTER_API_KEY in .env file.');
    }

    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.
Only return the translated text.

Text:
"""
${text}
"""`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://mini-translator.app',
                'X-Title': 'Mini Translator',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.1,
                max_tokens: 2048,
            }),
        });

        const data: OpenRouterResponse = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from API');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Translation failed. Please try again.');
    }
};
