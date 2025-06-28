import { ChangeEvent, useRef, useState } from 'react';
import { 
    CssBaseline, Box, ThemeProvider, createTheme, AppBar, Toolbar, Typography, 
    Drawer, List, ListItem, ListItemButton, ListItemText, TextField, Button, 
    LinearProgress, Alert, Paper, Chip, useMediaQuery, IconButton
} from '@mui/material';
import { UploadFile as UploadFileIcon, FolderOpen as FolderOpenIcon, Menu as MenuIcon } from '@mui/icons-material';
import ImageViewer from './components/ImageViewer';
import { useAppContext } from './context/useAppContext';

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
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setSelectedImage(null); // Reset selection when new file is chosen
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: { main: '#90caf9' },
            secondary: { main: '#f48fb1' },
            background: { default: '#1a1a1a', paper: '#2a2a2a' },
        },
    });

    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const drawerWidth = `clamp(280px, 22%, 360px)`;

    const drawerContent = (
        <>
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
                        <ListItemButton selected={selectedImage?.id === img.id} onClick={() => {
                            setSelectedImage(img);
                            if (isMobile) {
                                setMobileOpen(false);
                            }
                        }}>
                            <ListItemText primary={img.file_name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <AppBar 
                    position="fixed" 
                    sx={{ 
                        width: { lg: `calc(100% - ${drawerWidth})` },
                        ml: { lg: drawerWidth },
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { lg: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">COCO Viewer</Typography>
                    </Toolbar>
                </AppBar>
                <Box
                    component="nav"
                    sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
                    aria-label="mailbox folders"
                >
                    <Drawer
                        variant={isMobile ? 'temporary' : 'permanent'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        sx={{
                            display: { xs: 'block' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawerContent}
                    </Drawer>
                </Box>
                <Box 
                    component="main" 
                    sx={{ 
                        flexGrow: 1, 
                        p: { xs: 1, sm: 2, md: 3 }, 
                        width: { lg: `calc(100% - ${drawerWidth})` },
                        height: '100vh', 
                        display: 'flex', 
                        flexDirection: 'column' 
                    }}
                >
                    <Toolbar />
                    {selectedImage ? (
                        <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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