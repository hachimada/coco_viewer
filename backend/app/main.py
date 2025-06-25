from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
import json
from .services.coco_parser import parse_coco_annotations

app = FastAPI(
    title="COCO Viewer API",
    description="API for loading and interacting with COCO datasets.",
    version="1.0.0",
)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:5174", # Added for the new frontend port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174", # Added for the new frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for the annotation data. 
# For a production environment, consider a more robust storage solution.
annotations_data: Dict[str, Any] = {}

@app.post("/api/load_dataset", summary="Load COCO Annotation File")
async def load_dataset(file: UploadFile = File(..., description="The COCO annotation file (e.g., `instances_val2017.json`)")) -> Dict:
    """
    Uploads a COCO annotation file in JSON format, parses it, and stores it in memory.

    This endpoint performs a basic parsing of the file to extract summary information.
    The full dataset is stored to be used by other endpoints.

    - **file**: The COCO JSON file to upload.
    """
    global annotations_data
    try:
        content = await file.read()
        data = json.loads(content)
        annotations_data = data
        parsed_data = parse_coco_annotations(annotations_data)
        return parsed_data
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

@app.get("/api/images", summary="Get All Images")
def get_images() -> List[Dict]:
    """
    Retrieves a list of all image records from the loaded COCO dataset.

    Each image record typically contains `id`, `file_name`, `width`, and `height`.
    Returns an empty list if no dataset is loaded.
    """
    if not annotations_data:
        raise HTTPException(status_code=404, detail="No dataset loaded. Please upload a COCO file first.")
    return annotations_data.get("images", [])

@app.get("/api/annotations/{image_id}", summary="Get Annotations for an Image")
def get_annotations(image_id: int) -> List[Dict]:
    """
    Retrieves all annotations for a specific image, identified by its `image_id`.

    This is used to draw bounding boxes or other annotations on a selected image.
    Returns an empty list if the image ID is not found or has no annotations.

    - **image_id**: The ID of the image to retrieve annotations for.
    """
    if not annotations_data:
        raise HTTPException(status_code=404, detail="No dataset loaded. Please upload a COCO file first.")
    
    # Check if image_id exists
    image_ids = {img['id'] for img in annotations_data.get("images", [])}
    if image_id not in image_ids:
        raise HTTPException(status_code=404, detail=f"Image with ID {image_id} not found.")

    return [ann for ann in annotations_data.get("annotations", []) if ann["image_id"] == image_id]

@app.get("/", include_in_schema=False)
def read_root():
    return {"message": "Welcome to the COCO Viewer API. See /docs for documentation."}
