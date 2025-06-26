import { useState, ChangeEvent, useMemo, useRef } from 'react';
import { 
    CssBaseline, Box, ThemeProvider, createTheme, AppBar, Toolbar, Typography, 
    Drawer, List, ListItem, ListItemButton, ListItemText, TextField, Button, 
    CircularProgress, Alert, Paper, Chip, LinearProgress 
} from '@mui/material';
import { UploadFile as UploadFileIcon, FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import ImageViewer from './components/ImageViewer';
import type { Image, CocoData, Category } from './types'; // Import from the new types file

// --- Main App Component ---
const App = () => {
    // --- State Management ---
    const [imageDir, setImageDir] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [cocoData, setCocoData] = useState<CocoData | null>(null);
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hiddenCategories, setHiddenCategories] = useState<Set<number>>(new Set());

    // --- Event Handlers & Data Processing ---
    const toggleCategoryVisibility = (categoryId: number) => {
        setHiddenCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleSetImageDir = async () => {
        if (!imageDir) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/set_image_directory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: imageDir }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to set image directory.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setCocoData(null);
            setSelectedImage(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/api/load_dataset', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Failed to upload annotation file.');
            const data = await res.json();

            // Validate the new data structure
            if (!data.images || !data.annotations_by_image || !data.categories) {
                throw new Error('Invalid COCO file format: Missing required keys.');
            }

            const rawCategories = data.categories || [];
            const categoriesWithColor = rawCategories.map((cat: any, index: number) => ({
                ...cat,
                color: `hsl(${(index * 137.508) % 360}, 60%, 55%)`
            }));

            setCocoData({ 
                images: data.images, 
                annotations_by_image: data.annotations_by_image, 
                categories: categoriesWithColor 
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // --- Memoized Derived State (Optimized) ---
    const annotationsForSelectedImage = useMemo(() => {
        if (!cocoData || !selectedImage) return {};
        return cocoData.annotations_by_image[selectedImage.id] || {};
    }, [cocoData, selectedImage]);

    const categoriesForSelectedImage = useMemo(() => {
        if (!cocoData || !selectedImage) return [];
        const categoryIds = Object.keys(annotationsForSelectedImage).map(Number);
        const categoryIdSet = new Set(categoryIds);
        return cocoData.categories.filter(cat => categoryIdSet.has(cat.id));
    }, [cocoData, annotationsForSelectedImage]);


    // --- UI Rendering ---
    const drawerWidth = 300;
    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: { main: '#90caf9' },
            secondary: { main: '#f48fb1' },
            background: { default: '#1a1a1a', paper: '#2a2a2a' },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div">COCO Viewer</Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}
                >
                    <Toolbar />
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <TextField fullWidth label="Image Directory Path" variant="outlined" size="small" value={imageDir} onChange={(e) => setImageDir(e.target.value)} />
                            <Button fullWidth variant="contained" onClick={handleSetImageDir} startIcon={<FolderOpenIcon />} disabled={loading || !imageDir} sx={{ mt: 1 }}>Set Directory</Button>
                        </Box>
                        <Box>
                            <Button fullWidth variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                                Select Annotation File
                                <input type="file" hidden accept=".json" onChange={handleFileChange} ref={fileInputRef} />
                            </Button>
                            {file && <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>{file.name}</Typography>}
                            <Button fullWidth variant="contained" color="secondary" onClick={handleUpload} disabled={!file || loading} sx={{ mt: 1 }}>Load Dataset</Button>
                        </Box>
                        {loading && <LinearProgress color="secondary" />}
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    </Box>
                    <List sx={{ overflowY: 'auto' }}>
                        {cocoData?.images.map((img) => (
                            <ListItem key={img.id} disablePadding>
                                <ListItemButton selected={selectedImage?.id === img.id} onClick={() => setSelectedImage(img)}>
                                    <ListItemText primary={img.file_name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Toolbar />
                    {selectedImage ? (
                        <Paper elevation={3} sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Typography variant="h5" gutterBottom>{selectedImage.file_name}</Typography>
                            <Box mb={2}>
                                {categoriesForSelectedImage.map(cat => (
                                    <Chip 
                                        key={cat.id} 
                                        label={cat.name} 
                                        onClick={() => toggleCategoryVisibility(cat.id)}
                                        sx={{ 
                                            mr: 1, 
                                            mb: 1, 
                                            backgroundColor: cat.color, 
                                            color: 'white', 
                                            opacity: hiddenCategories.has(cat.id) ? 0.5 : 1,
                                            cursor: 'pointer',
                                        }} 
                                    />
                                ))}
                            </Box>
                            <ImageViewer 
                                key={selectedImage.id}
                                image={selectedImage} 
                                annotationsForImage={annotationsForSelectedImage} 
                                categories={cocoData?.categories || []} 
                                imageUrl={`http://localhost:8000/images/${selectedImage.file_name}`}
                                hiddenCategories={hiddenCategories}
                            />
                        </Paper>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography variant="h6" color="text.secondary">Select an image to begin</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default App;