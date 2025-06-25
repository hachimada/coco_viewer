import React, { useRef, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// --- Type Definitions ---
interface Image {
    id: number;
    file_name: string;
    width: number;
    height: number;
}

interface Annotation {
    id: number;
    image_id: number;
    category_id: number;
    bbox: [number, number, number, number];
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface ImageViewerProps {
    image: Image;
    annotations: Annotation[];
    categories: Category[];
    imageUrl: string;
}

// --- ImageViewer Component ---
const ImageViewer: React.FC<ImageViewerProps> = ({ image, annotations, categories, imageUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.src = imageUrl;
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            setIsLoading(false);
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(img, 0, 0);

            const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

            annotations.forEach(ann => {
                const [x, y, width, height] = ann.bbox;
                const category = categoryMap.get(ann.category_id);
                
                ctx.strokeStyle = category ? category.color : '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                if (category) {
                    ctx.fillStyle = category.color;
                    ctx.font = 'bold 14px sans-serif';
                    const label = category.name;
                    const textWidth = ctx.measureText(label).width;
                    ctx.fillRect(x, y, textWidth + 8, 20);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(label, x + 4, y + 15);
                }
            });
        };

        img.onerror = () => {
            setIsLoading(false);
            setError(`Failed to load image from: ${imageUrl}`);
        }

    }, [image, annotations, categories, imageUrl]);

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isLoading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            <canvas 
                ref={canvasRef} 
                style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    height: 'auto', 
                    width: 'auto',
                    display: isLoading || error ? 'none' : 'block' 
                }} 
            />
        </Box>
    );
};

export default ImageViewer;
