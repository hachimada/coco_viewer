from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from collections import defaultdict
import json
import os

from app.services.coco_parser import process_coco_dataset

app = FastAPI(
    title="COCO Viewer API",
    description="API for loading and interacting with COCO datasets.",
    version="1.1.0", # Version bump to reflect new data structure
)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/set_image_directory", summary="Set Image Directory")
def set_image_directory(path: str = Body(..., embed=True)):
    """
    Sets the absolute path to the directory containing the images.
    This path will be used to serve images statically.
    """
    if not os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Invalid directory path.")
    
    # Unmount if already mounted to allow for changing directories
    for route in app.routes:
        if route.name == "images":
            app.routes.remove(route)
            break
    
    app.mount("/images", StaticFiles(directory=path), name="images")
    return {"message": f"Image directory set to {path}"}

@app.post("/api/load_dataset", summary="Load and Process Dataset")
async def load_dataset(file: UploadFile = File(..., description="The COCO annotation file (e.g., `instances_val2017.json`)")) -> Dict:
    """
    Uploads a COCO annotation file, processes it into an optimized structure,
    and returns the structured data.
    """
    try:
        content = await file.read()
        data = json.loads(content)

        processed_data = process_coco_dataset(data)

        # --- Return new data structure ---
        return processed_data

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file.")
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid COCO format: Missing key {e}")
    except Exception as e:
        import traceback
        print(f"An unexpected error occurred: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.get("/", include_in_schema=False)
def read_root():
    return {"message": "Welcome to the COCO Viewer API. See /docs for documentation."}