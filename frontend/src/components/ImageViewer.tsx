import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { AnnotationsForImage, Image, Category } from '../types';

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

    // State for pan and zoom
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastDragPosition, setLastDragPosition] = useState({ x: 0, y: 0 });

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Save context, apply transformations
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        // Draw the image
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
                
                // Adjust line width and font size based on scale
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

        // Restore context
        ctx.restore();
    }, [offset, scale, categories, annotationsForImage, hiddenCategories]);

    // Effect for loading the image
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
            // Reset zoom/pan and trigger redraw by setting loading to false
            setScale(1);
            setOffset({ x: 0, y: 0 });
            setIsLoading(false); 
        };

        img.onerror = () => {
            setIsLoading(false);
            setError(`Failed to load image from: ${imageUrl}`);
        }
    }, [imageUrl]); // Only re-run when the image URL changes

    // Effect for re-drawing when data changes
    useEffect(() => {
        if (!isLoading && imageRef.current?.complete) {
            drawCanvas();
        }
    }, [isLoading, drawCanvas, hiddenCategories, annotationsForImage, categories]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setLastDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastDragPosition.x;
        const deltaY = e.clientY - lastDragPosition.y;
        setOffset({ x: offset.x + deltaX, y: offset.y + deltaY });
        setLastDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleFactor = 1.1;
        const newScale = e.deltaY < 0 ? scale * scaleFactor : scale / scaleFactor;
        
        // New offset to zoom towards the mouse point
        const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
        const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale);

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
    };

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