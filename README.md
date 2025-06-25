# COCO Viewer

COCO Viewer is a web-based GUI application for visualizing COCO format datasets.
It is designed to be extensible to support various annotation tasks, starting with object detection.

## Features

- **Web-based Interface:** Access the viewer from your browser.
- **COCO Format Support:** Load and parse COCO annotation files (JSON).
- **Object Detection Visualization:** View images with bounding box annotations.
- **Extensible Design:** The application is designed to be easily extended to support other tasks like segmentation and keypoint detection.

## Project Structure

```bash
coco_viewer/
├── backend/              # FastAPI application
│   ├── .venv/              # Virtual environment created by uv
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # API endpoint definitions
│   │   └── services/
│   │       └── coco_parser.py  # COCO dataset parsing logic
│   └── pyproject.toml      # Project metadata and dependencies
├── frontend/             # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ImageViewer.tsx
│   │   ├── App.css
│   │   ├── App.tsx
│   │   └── ...
│   ├── index.html
│   └── ...
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Python](https://www.python.org/) (v3.9 or later)
- [uv](https://github.com/astral-sh/uv) (Python package installer)

### Installation & Running

1. **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd coco_viewer
    ```

2. **Backend Setup:**

    ```bash
    # Navigate to the backend directory
    cd backend

    # Install dependencies from pyproject.toml
    uv sync

    # Start the backend server
    uv run uvicorn app.main:app --host 0.0.0.0 --port 8001
    ```

3. **Frontend Setup:**

    In a new terminal:

    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install

    # Start the frontend development server
    npm run dev
    ```

4. **Access the application:**

    Open your browser and go to `http://localhost:5173`.

## How to Use

1. **Provide Image Directory URL:**
    - Before uploading your annotation file, you need to provide a URL to the directory where your images are hosted. This could be a local server URL (e.g., `http://localhost:8080/images`) or a remote URL.
    - For local images, you can start a simple HTTP server in your image directory. For example, using Python:

        ```bash
        # In your images directory
        python -m http.server 8080
        ```

    - Then, enter `http://localhost:8080` into the "Image Directory URL" input field.

2. **Upload COCO Annotation File:**
    - Click the "Choose File" button and select your COCO annotation file (in `.json` format).
    - Click the "Upload" button.

3. **View Images and Annotations:**
    - Once the annotation file is loaded, a list of images will appear in the sidebar.
    - Click on an image file name to display the image and its corresponding bounding box annotations.

## API Documentation

The backend API is built with FastAPI, which provides automatic interactive documentation.

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

These interfaces allow you to explore and interact with the API endpoints.

## Extensibility

To extend the application to support other annotation tasks (e.g., segmentation):

1. **Backend (`coco_parser.py`):**
    - Implement a new parsing function (e.g., `parse_segmentation_annotations`).
    - Update the `load_dataset` endpoint in `main.py` to call the new function.

2. **Frontend (`ImageViewer.tsx`):**
    - Update the component to receive and render the new annotation data (e.g., drawing polygons for segmentation).

