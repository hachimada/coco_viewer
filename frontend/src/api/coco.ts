import type { CocoData, Category } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const setImageDirectory = async (path: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/set_image_directory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to set image directory.');
    }
};

export const loadCocoDataset = async (file: File): Promise<CocoData> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/load_dataset`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload annotation file.');
    }

    const data = await response.json();

    if (!data.images || !data.annotations_by_image || !data.categories) {
        throw new Error('Invalid COCO file format: Missing required keys.');
    }

    const categoriesWithColor: Category[] = (data.categories || []).map((cat: any, index: number) => ({
        ...cat,
        color: `hsl(${(index * 137.508) % 360}, 60%, 55%)`,
    }));

    return {
        images: data.images,
        annotations_by_image: data.annotations_by_image,
        categories: categoriesWithColor,
    };
};