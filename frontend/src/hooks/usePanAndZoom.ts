import { useState, useCallback } from 'react';

interface PanAndZoomOptions {
    initialScale?: number;
    initialOffset?: { x: number; y: number };
}

export const usePanAndZoom = (options: PanAndZoomOptions = {}) => {
    const {
        initialScale = 1,
        initialOffset = { x: 0, y: 0 },
    } = options;

    const [scale, setScale] = useState(initialScale);
    const [offset, setOffset] = useState(initialOffset);
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setLastDragPosition({ x: e.clientX, y: e.clientY });
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastDragPosition.x;
        const deltaY = e.clientY - lastDragPosition.y;
        setOffset(prevOffset => ({ x: prevOffset.x + deltaX, y: prevOffset.y + deltaY }));
        setLastDragPosition({ x: e.clientX, y: e.clientY });
    }, [isDragging, lastDragPosition]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleFactor = 1.1;
        const newScale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor;
        
        const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
        const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale);

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    }, [scale, offset]);

    const reset = useCallback((newValues: { scale: number; offset: { x: number; y: number } }) => {
        if (newValues) {
            setScale(newValues.scale);
            setOffset(newValues.offset);
        }
    }, []);

    return {
        scale,
        offset,
        isDragging,
        handleMouseDown,
        handleMouseUp,
        handleMouseLeave,
        handleMouseMove,
        handleWheel,
        reset,
    };
};