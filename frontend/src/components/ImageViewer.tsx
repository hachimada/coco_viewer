import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { AnnotationsForImage, Image, Category } from '../types';
import { usePanAndZoom } from '../hooks/usePanAndZoom';

interface ImageViewerProps {
    image: Image;
    annotationsForImage: AnnotationsForImage;
    categories: Category[];
    imageUrl: string;
    hiddenCategories: Set<number>;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ image, annotationsForImage, categories, imageUrl, hiddenCategories }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { 
        scale, 
        offset, 
        isDragging, 
        handleMouseDown, 
        handleMouseUp, 
        handleMouseLeave, 
        handleMouseMove, 
        handleWheel, 
        reset: resetPanAndZoom 
    } = usePanAndZoom();

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        ctx.drawImage(img, 0, 0);

        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

        for (const categoryId in annotationsForImage) {
            if (hiddenCategories.has(Number(categoryId))) {
                continue;
            }

            const category = categoryMap.get(Number(categoryId));
            if (!category) continue;

            const annotations = annotationsForImage[categoryId];
            
            annotations.forEach(ann => {
                const [x, y, width, height] = ann.bbox;
                
                const lineWidth = 2 / scale;
                const fontSize = 14 / scale;

                ctx.strokeStyle = category.color;
                ctx.lineWidth = lineWidth;
                ctx.strokeRect(x, y, width, height);

                ctx.font = `bold ${fontSize}px sans-serif`;
                const label = category.name;
                const textMetrics = ctx.measureText(label);
                const textWidth = textMetrics.width;
                const textHeight = fontSize; 

                const padding = 4 / scale;
                ctx.fillStyle = category.color;
                ctx.fillRect(x, y, textWidth + padding * 2, textHeight + padding * 2);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(label, x + padding, y + textHeight + padding / 2);
            });
        }

        ctx.restore();
    }, [offset, scale, categories, annotationsForImage, hiddenCategories]);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        
        const img = new window.Image();
        img.src = imageUrl;
        img.crossOrigin = "Anonymous";
        imageRef.current = img;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }
            resetPanAndZoom();
            setIsLoading(false); 
        };

        img.onerror = () => {
            setIsLoading(false);
            setError(`Failed to load image from: ${imageUrl}`);
        }
    }, [imageUrl, resetPanAndZoom]);

    useEffect(() => {
        if (!isLoading && imageRef.current?.complete) {
            drawCanvas();
        }
    }, [isLoading, drawCanvas, hiddenCategories, annotationsForImage, categories]);

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}>
            {isLoading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-20px', marginLeft: '-20px' }} />}
            {error && <Typography color="error" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{error}</Typography>}
            <canvas 
                ref={canvasRef} 
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
                style={{ 
                    display: isLoading || error ? 'none' : 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                }} 
            />
        </Box>
    );
};

export default ImageViewer;