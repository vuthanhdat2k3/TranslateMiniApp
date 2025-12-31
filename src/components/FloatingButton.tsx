import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useDrag } from '../hooks/useDrag';

interface FloatingButtonProps {
    onExpand: () => void;
}

export const FloatingButton = ({ onExpand }: FloatingButtonProps) => {
    const { startDrag } = useDrag();

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-14 h-14 flex items-center justify-center"
        >
            <motion.button
                onClick={onExpand}
                onMouseDown={startDrag}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
                   shadow-lg shadow-blue-500/30 flex items-center justify-center
                   cursor-pointer border border-white/20 backdrop-blur-sm
                   hover:shadow-xl hover:shadow-blue-500/40 transition-shadow"
            >
                <Languages className="w-6 h-6 text-white" />
            </motion.button>
        </motion.div>
    );
};
