import { useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const useDrag = () => {
    const startDrag = useCallback(async () => {
        try {
            await getCurrentWindow().startDragging();
        } catch (error) {
            console.error('Failed to start dragging:', error);
        }
    }, []);

    return { startDrag };
};
