import { ChangeEvent, useRef } from 'react';
import { 
    CssBaseline, Box, ThemeProvider, createTheme, AppBar, Toolbar, Typography, 
    Drawer, List, ListItem, ListItemButton, ListItemText, TextField, Button, 
    LinearProgress, Alert, Paper, Chip 
} from '@mui/material';
import { UploadFile as UploadFileIcon, FolderOpen as FolderOpenIcon } from '@mui/icons-material';
import ImageViewer from './components/ImageViewer';
import { useAppContext } from './context/AppContext';

const App = () => {
    const {
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
    } = useAppContext();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setSelectedImage(null); // Reset selection when new file is chosen
        }
    };

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