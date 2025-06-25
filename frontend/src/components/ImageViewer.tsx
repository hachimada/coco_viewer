import React, { useRef, useEffect } from 'react';

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

interface ImageViewerProps {
  image: Image;
  annotations: Annotation[];
  imageDir: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ image, annotations, imageDir }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    // NOTE: For local files, you need to serve them via a local server.
    // For this example, we assume the imageDir is a URL prefix.
    img.src = `${imageDir}/${image.file_name}`;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      annotations.forEach(ann => {
        const [x, y, width, height] = ann.bbox;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
      });
    };

    img.onerror = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(`Error: Could not load image from ${img.src}`, 10, 20);
    }

  }, [image, annotations, imageDir]);

  return <canvas ref={canvasRef} />;
};

export default ImageViewer;
