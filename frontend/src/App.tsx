import { useState, ChangeEvent, useEffect } from 'react';
import './App.css';
import ImageViewer from './components/ImageViewer';

interface CocoInfo {
  info: any;
  licenses: any[];
  num_images: number;
  num_annotations: number;
  num_categories: number;
}

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

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [cocoInfo, setCocoInfo] = useState<CocoInfo | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [imageDir, setImageDir] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setCocoInfo(null);
      setImages([]);
      setSelectedImage(null);
      setAnnotations([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/load_dataset', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setCocoInfo(data);
        fetchImages();
      } else {
        alert('File upload failed.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAnnotations = async (imageId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/annotations/${imageId}`);
      if (res.ok) {
        const data = await res.json();
        setAnnotations(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      fetchAnnotations(selectedImage.id);
    }
  }, [selectedImage]);

  return (
    <div className="App">
      <div className="sidebar">
        <h2>Images</h2>
        <input type="text" value={imageDir} onChange={(e) => setImageDir(e.target.value)} placeholder="Enter Image Directory URL" />
        <ul>
          {images.map(img => (
            <li key={img.id} onClick={() => setSelectedImage(img)} className={selectedImage?.id === img.id ? 'selected' : ''}>
              {img.file_name}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        <header className="App-header">
          <h1>COCO Viewer</h1>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!file}>Upload</button>
        </header>
        {cocoInfo && (
          <div className="dataset-info">
            <p>Images: {cocoInfo.num_images}, Annotations: {cocoInfo.num_annotations}, Categories: {cocoInfo.num_categories}</p>
          </div>
        )}
        {selectedImage && imageDir && (
          <ImageViewer image={selectedImage} annotations={annotations} imageDir={imageDir} />
        )}
      </div>
    </div>
  );
}

export default App;
