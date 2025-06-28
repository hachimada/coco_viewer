// --- Shared Type Definitions for the Application ---

export interface Image {
  id: number;
  file_name: string;
  width: number;
  height: number;
}

export interface ProcessedAnnotation {
  id: number;
  bbox: [number, number, number, number];
}

export type AnnotationsForImage = Record<string, ProcessedAnnotation[]>; // Key is category_id

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface CocoData {
  images: Image[];
  annotations_by_image: Record<string, AnnotationsForImage>; // Key is image_id
  categories: Category[];
}
