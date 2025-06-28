import React, { useState, useMemo, useCallback, type ReactNode } from 'react';
import type { CocoData, Image, Category, ProcessedAnnotation } from '../types';
import {
  setImageDirectory as apiSetImageDirectory,
  loadCocoDataset as apiLoadCocoDataset,
} from '../api/coco';
import { AppContext } from './useAppContext';

export interface AppContextType {
  imageDir: string;
  setImageDir: (path: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  cocoData: CocoData | null;
  selectedImage: Image | null;
  setSelectedImage: (image: Image | null) => void;
  loading: boolean;
  error: string | null;
  handleSetImageDir: () => Promise<void>;
  handleUpload: () => Promise<void>;
  hiddenCategories: Set<number>;
  toggleCategoryVisibility: (categoryId: number) => void;
  annotationsForSelectedImage: Record<string, ProcessedAnnotation[]>;
  categoriesForSelectedImage: Category[];
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [imageDir, setImageDir] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [cocoData, setCocoData] = useState<CocoData | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<number>>(new Set());

  const handleSetImageDir = useCallback(async () => {
    if (!imageDir) return;
    setLoading(true);
    setError(null);
    try {
      await apiSetImageDirectory(imageDir);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [imageDir]);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiLoadCocoDataset(file);
      setCocoData(data);
      setSelectedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [file]);

  const toggleCategoryVisibility = useCallback((categoryId: number) => {
    setHiddenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const annotationsForSelectedImage = useMemo(() => {
    if (!cocoData || !selectedImage) return {};
    return cocoData.annotations_by_image[selectedImage.id] || {};
  }, [cocoData, selectedImage]);

  const categoriesForSelectedImage = useMemo(() => {
    if (!cocoData || !selectedImage) return [];
    const categoryIds = Object.keys(annotationsForSelectedImage).map(Number);
    const categoryIdSet = new Set(categoryIds);
    return cocoData.categories.filter((cat) => categoryIdSet.has(cat.id));
  }, [cocoData, selectedImage, annotationsForSelectedImage]);

  const value = {
    imageDir,
    setImageDir,
    file,
    setFile,
    cocoData,
    selectedImage,
    setSelectedImage,
    loading,
    error,
    handleSetImageDir,
    handleUpload,
    hiddenCategories,
    toggleCategoryVisibility,
    annotationsForSelectedImage,
    categoriesForSelectedImage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
