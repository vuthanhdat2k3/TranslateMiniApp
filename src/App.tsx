import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import {
  Languages, ArrowRightLeft, Copy, Check, Loader2, X, GripVertical,
  Mic, MicOff, ChevronDown, Settings
} from 'lucide-react';
import { translateText } from './services/translate';
import { translateTextArgos } from './services/translateArgos';
import { useDrag } from './hooks/useDrag';
import './App.css';

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', label: 'Tiếng Anh' },
  { code: 'vi-VN', name: 'Vietnamese', label: 'Tiếng Việt' },
  { code: 'zh-CN', name: 'Chinese', label: 'Tiếng Trung' },
  { code: 'ja-JP', name: 'Japanese', label: 'Tiếng Nhật' },
  { code: 'ko-KR', name: 'Korean', label: 'Tiếng Hàn' },
  { code: 'th-TH', name: 'Thai', label: 'Tiếng Thái' },
  { code: 'tl-PH', name: 'Filipino', label: 'Philippines' },
  { code: 'fr-FR', name: 'French', label: 'Tiếng Pháp' },
  { code: 'es-ES', name: 'Spanish', label: 'Tây Ban Nha' },
  { code: 'de-DE', name: 'German', label: 'Tiếng Đức' },
  { code: 'ru-RU', name: 'Russian', label: 'Tiếng Nga' },
];

type Engine = 'gemini' | 'libre';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [engine, setEngine] = useState<Engine>('gemini');
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);

  // Language State
  const [sourceLang, setSourceLang] = useState(SUPPORTED_LANGUAGES[0]); // English
  const [targetLang, setTargetLang] = useState(SUPPORTED_LANGUAGES[1]); // Vietnamese
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const isVisibleRef = useRef(true);
  const outputTextRef = useRef('');
  const sourceLangRef = useRef(sourceLang);
  const targetLangRef = useRef(targetLang);
  const engineRef = useRef(engine);
  const lastToggleTime = useRef(0);
  const { startDrag } = useDrag();

  // Keep refs in sync with state
  useEffect(() => {
    outputTextRef.current = outputText;
    sourceLangRef.current = sourceLang;
    targetLangRef.current = targetLang;
    engineRef.current = engine;
  }, [outputText, sourceLang, targetLang, engine]);

  // Handle Voice Input
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = sourceLangRef.current.code;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      // Auto translate after voice input
      setTimeout(() => handleTranslate(transcript), 500);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  // Handle translation
  const handleTranslate = async (textToTranslate = inputText) => {
    if (!textToTranslate.trim() || isLoading) return;

    setIsLoading(true);
    try {
      let result = '';
      if (engineRef.current === 'gemini') {
        result = await translateText({
          text: textToTranslate.trim(),
          sourceLanguage: sourceLangRef.current.name,
          targetLanguage: targetLangRef.current.name,
        });
      } else {
        // Argos Translate (local server)
        const srcCode = sourceLangRef.current.code.split('-')[0];
        const tgtCode = targetLangRef.current.code.split('-')[0];

        result = await translateTextArgos({
          text: textToTranslate.trim(),
          sourceLanguage: srcCode,
          targetLanguage: tgtCode,
        });
      }
      setOutputText(result);
    } catch (err) {
      setOutputText(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copy with debounce
  const handleCopy = useCallback(async () => {
    const text = outputTextRef.current;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Swap languages
  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  // Toggle window visibility
  const toggleVisibility = useCallback(async () => {
    const now = Date.now();
    if (now - lastToggleTime.current < 300) return;
    lastToggleTime.current = now;

    const appWindow = getCurrentWindow();

    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      await appWindow.hide();
    } else {
      isVisibleRef.current = true;
      await appWindow.show();
      await appWindow.setFocus();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  // Close app
  const handleClose = async () => {
    await getCurrentWindow().close();
  };

  // Register global shortcuts
  useEffect(() => {
    const setupShortcuts = async () => {
      try {
        await register('Ctrl+Shift+T', toggleVisibility);
        await register('Ctrl+Shift+C', handleCopy);
        await register('Ctrl+Shift+V', () => {
          toggleListeningRef.current?.();
        });
      } catch (err) {
        console.error('Failed to register shortcuts:', err);
      }
    };
    setupShortcuts();
    return () => {
      unregister('Ctrl+Shift+T').catch(console.error);
      unregister('Ctrl+Shift+C').catch(console.error);
      unregister('Ctrl+Shift+V').catch(console.error);
    };
  }, [toggleVisibility, handleCopy]);

  // Ref to hold latest toggleListening to avoid re-registering shortcuts constantly
  const toggleListeningRef = useRef(toggleListening);
  useEffect(() => {
    toggleListeningRef.current = toggleListening;
  }, [toggleListening]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <motion.div
      className="app-container"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="translator-compact">
        {/* Drag Handle */}
        <div className="drag-handle" onMouseDown={startDrag}>
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>

        {/* Engine Selector (Small top right) */}
        <div className="absolute top-[6px] right-[28px] z-50">
          <button
            onClick={() => setShowEngineDropdown(!showEngineDropdown)}
            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all flex items-center gap-1"
            title="Switch Engine"
          >
            {engine === 'gemini' ? 'GEMINI' : 'ARGOS'}
          </button>

          {showEngineDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowEngineDropdown(false)}
            />
          )}

          {showEngineDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-full right-0 mt-1 w-24 bg-slate-800 border border-slate-700 rounded shadow-xl overflow-hidden z-50 flex flex-col"
            >
              <button
                onClick={() => { setEngine('gemini'); setShowEngineDropdown(false); }}
                className={`px-2 py-1.5 text-[10px] text-left hover:bg-white/10 ${engine === 'gemini' ? 'text-blue-400 font-bold' : 'text-gray-400'}`}
              >
                Gemini 2.0
              </button>
              <button
                onClick={() => { setEngine('libre'); setShowEngineDropdown(false); }}
                className={`px-2 py-1.5 text-[10px] text-left hover:bg-white/10 ${engine === 'libre' ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}
              >
                Argos/Libre
              </button>
            </motion.div>
          )}
        </div>

        {/* Language Indicator */}
        <div className="lang-indicator relative z-40">
          <Languages className="w-4 h-4 text-blue-400" />

          {/* Source Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors relative z-50"
            >
              {sourceLang.label}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showSourceDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSourceDropdown(false)}
              />
            )}

            <AnimatePresence>
              {showSourceDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-y-auto max-h-60 z-50"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSourceLang(lang);
                        setShowSourceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors
                        ${sourceLang.code === lang.code ? 'text-blue-400 bg-slate-700/50' : 'text-gray-300'}
                      `}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ArrowRightLeft
            className="w-3 h-3 text-gray-500 cursor-pointer hover:text-white transition-colors flex-shrink-0"
            onClick={handleSwap}
          />

          {/* Target Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTargetDropdown(!showTargetDropdown)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors relative z-50"
            >
              {targetLang.label}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showTargetDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowTargetDropdown(false)}
              />
            )}

            <AnimatePresence>
              {showTargetDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-y-auto max-h-60 z-50"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setTargetLang(lang);
                        setShowTargetDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors
                        ${targetLang.code === lang.code ? 'text-emerald-400 bg-slate-700/50' : 'text-gray-300'}
                      `}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Row */}
        <div className="input-row relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Nói hoặc nhập (${sourceLang.label})...`}
            className="input-field pr-8"
            autoFocus
          />

          {/* Mic Button */}
          <button
            onClick={toggleListening}
            className={`absolute right-[52px] top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all
              ${isListening
                ? 'bg-red-500/20 text-red-500 animate-pulse'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => handleTranslate()}
            disabled={isLoading || !inputText.trim()}
            className="translate-btn"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-xs font-medium">GO</span>
            )}
          </button>
        </div>

        {/* Output Row */}
        <div className="output-row">
          <input
            type="text"
            value={outputText}
            readOnly
            placeholder="Translation..."
            className="output-field"
          />
          <button
            onClick={handleCopy}
            disabled={!outputText}
            className="copy-btn"
            title="Ctrl+Shift+C"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Close Button */}
        <button
          className="close-btn"
          onClick={handleClose}
        >
          <X className="w-3 h-3" />
        </button>

        {/* Shortcut hint */}
        <div className="shortcut-hint">
          <span>Ctrl+Shift+T: Toggle</span>
          <span>Ctrl+Shift+C: Copy</span>
          <span>Ctrl+Shift+V: Voice</span>
        </div>
      </div>
    </motion.div>
  );
}

export default App;
