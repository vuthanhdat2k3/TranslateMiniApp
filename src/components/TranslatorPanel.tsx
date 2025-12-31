import { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, Loader2, Check, AlertCircle } from 'lucide-react';
import { translateText } from '../services/translate';

interface TranslatorPanelProps {
    sourceLang: string;
    targetLang: string;
    onCollapse: () => void;
}

export const TranslatorPanel = ({ sourceLang, targetLang, onCollapse }: TranslatorPanelProps) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleTranslate = async () => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await translateText({
                text: inputText.trim(),
                sourceLanguage: sourceLang === 'en' ? 'English' : 'Vietnamese',
                targetLanguage: targetLang === 'en' ? 'English' : 'Vietnamese',
            });
            setOutputText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Translation failed');
            setOutputText('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTranslate();
        }
        if (e.key === 'Escape') {
            onCollapse();
        }
    };

    const handleCopy = async () => {
        if (!outputText) return;

        try {
            await navigator.clipboard.writeText(outputText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setError(null);
        inputRef.current?.focus();
    };

    // Global keyboard shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCollapse();
            }
            if (e.ctrlKey && e.key === 'Enter') {
                handleTranslate();
            }
            if (e.ctrlKey && e.key === 'c' && outputText && !window.getSelection()?.toString()) {
                handleCopy();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [outputText, onCollapse]);

    return (
        <div className="flex flex-col flex-1 p-4 gap-3 overflow-hidden">
            {/* Input Area */}
            <div className="flex-1 min-h-[80px]">
                <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter text to translate... (Enter to translate, Shift+Enter for new line)"
                    className="w-full h-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                     text-white placeholder-gray-500 resize-none
                     focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30
                     transition-all text-sm"
                />
            </div>

            {/* Output Area */}
            <div className="flex-1 min-h-[80px] relative">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="w-full h-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30
                         text-red-400 flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : (
                    <textarea
                        value={outputText}
                        readOnly
                        placeholder="Translation will appear here..."
                        className="w-full h-full px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20
                       text-emerald-100 placeholder-gray-600 resize-none
                       focus:outline-none text-sm cursor-default"
                    />
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={handleCopy}
                    disabled={!outputText || isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     bg-white/5 hover:bg-white/10 border border-white/10
                     text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleClear}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     bg-white/5 hover:bg-white/10 border border-white/10
                     text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                </button>
            </div>
        </div>
    );
};
