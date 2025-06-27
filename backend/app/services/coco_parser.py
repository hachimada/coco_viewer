from typing import Dict, Any
from collections import defaultdict

def process_coco_dataset(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes raw COCO dataset dictionary into an optimized structure for the viewer.

    Args:
        data: A dictionary representing the loaded COCO JSON data.

    Returns:
        A dictionary containing:
        - images: List of image metadata.
        - categories: List of category metadata.
        - annotations_by_image: A nested dictionary mapping image_id to category_id to a list of processed annotations.
    """
    annotations_by_image = defaultdict(lambda: defaultdict(list))
    for ann in data.get('annotations', []):
        # Keep only necessary fields to reduce payload size
        processed_ann = {
            'id': ann['id'],
            'bbox': ann['bbox']
        }
        annotations_by_image[ann['image_id']][ann['category_id']].append(processed_ann)

    return {
        "images": data.get('images', []),
        "categories": data.get('categories', []),
        "annotations_by_image": annotations_by_image,
    }
