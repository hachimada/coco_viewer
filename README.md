# COCO Viewer

A modern, performant web-based GUI application for visualizing COCO format datasets, built with FastAPI and React (MUI).

## Features

-   **Modern UI:** A sleek, responsive interface built with Material-UI (MUI), featuring a dark mode theme.
-   **Local Image Directory Support:** Securely browse and visualize images directly from your local filesystem.
-   **Dynamic Bounding Box Colors:** Bounding boxes are automatically colored by category for clear and intuitive visualization.
-   **Context-Aware Legend:** A category legend (chips) dynamically displays only the categories present in the currently viewed image.
-   **High Performance:** Optimized data loading and rendering pipeline to ensure a smooth experience, even with large datasets. All annotations are fetched at once to eliminate lag when switching between images.
-   **Extensible Design:** The application is designed to be easily extended to support other tasks like segmentation and keypoint detection.

## Project Structure

```bash
coco_viewer/
├── backend/              # FastAPI application
│   ├── .venv/              # Virtual environment managed by uv
│   ├── app/
│   │   ├── main.py         # API endpoint definitions
│   │   └── services/
│   │       └── coco_parser.py  # (Currently unused, for future extension)
│   └── pyproject.toml      # Project metadata and dependencies
├── frontend/             # React application
│   ├── src/
│   │   ├── components/
│   │   │   └── ImageViewer.tsx
│   │   └── App.tsx         # Main application component
│   └── ...
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Python](https://www.python.org/) (v3.9 or later)
-   [uv](https://github.com/astral-sh/uv) (A fast Python package installer and resolver)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd coco_viewer
    ```

2.  **Run the Backend Server:**
    Open a terminal window.
    ```bash
    # Navigate to the backend directory
    cd backend

    # Create and sync the virtual environment
    uv venv
    uv sync

    # Activate the virtual environment
    # On macOS/Linux:
    source .venv/bin/activate
    # On Windows:
    # .venv\Scripts\activate

    # Start the backend server
    uvicorn app.main:app --host 0.0.0.0 --port 8000
    ```
    The backend is now running on `http://localhost:8000`.

3.  **Run the Frontend Application:**
    Open a **new** terminal window.
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install

    # Start the frontend development server
    npm run dev
    ```
    The frontend is now running, typically on `http://localhost:5173` or a similar port.

4.  **Access the Application:**
    Open your browser and navigate to the URL provided by the `npm run dev` command.

## How to Use

1.  **Set Image Directory:**
    -   In the sidebar, enter the **absolute path** to the local directory where your dataset images are stored.
    -   Click the "Set Directory" button. The backend will now be able to serve these images to the application.

2.  **Load Annotation File:**
    -   Click "Select Annotation File" and choose your COCO `*.json` file.
    -   Click "Load Dataset". The application will load and process all annotations, images, and categories.

3.  **Explore the Dataset:**
    -   The image list will populate in the sidebar.
    -   Click on any image name to view it.
    -   The viewer will display the image with bounding boxes colored by category. The legend above the image shows which colors correspond to which categories present in that specific image.

## API Documentation

The backend API is built with FastAPI, which provides automatic interactive documentation. While the application is running, you can access it at:

-   **Swagger UI:** `http://localhost:8000/docs`

