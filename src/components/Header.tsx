import { ArrowLeftRight, Minus, X } from 'lucide-react';
import { useDrag } from '../hooks/useDrag';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface HeaderProps {
    sourceLang: string;
    targetLang: string;
    onSwap: () => void;
    onCollapse: () => void;
}

const LANG_NAMES: Record<string, string> = {
    en: 'EN',
    vi: 'VI',
};

export const Header = ({ sourceLang, targetLang, onSwap, onCollapse }: HeaderProps) => {
    const { startDrag } = useDrag();

    const handleClose = async () => {
        await getCurrentWindow().close();
    };

    return (
        <div
            onMouseDown={startDrag}
            className="flex items-center justify-between px-4 py-3 
                 border-b border-white/10 cursor-move select-none"
        >
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-400">
                    {LANG_NAMES[sourceLang] || sourceLang.toUpperCase()}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSwap();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeftRight className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-emerald-400">
                    {LANG_NAMES[targetLang] || targetLang.toUpperCase()}
                </span>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCollapse();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-yellow-400"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
