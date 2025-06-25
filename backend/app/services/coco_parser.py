import json
from typing import Dict, Any

def parse_coco_annotations(annotations: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses the root of a COCO annotation dictionary to extract summary information.

    This function is designed to be extensible for different COCO tasks.
    Currently, it provides a high-level overview of the dataset.

    Args:
        annotations: A dictionary representing the loaded COCO JSON data.

    Returns:
        A dictionary containing summary information:
        - info: The content of the 'info' section.
        - licenses: The content of the 'licenses' section.
        - num_images: The total number of images.
        - num_annotations: The total number of annotations.
        - num_categories: The total number of categories.
    """
    info = annotations.get("info", {})
    licenses = annotations.get("licenses", [])
    images = annotations.get("images", [])
    annotations_data = annotations.get("annotations", [])
    categories = annotations.get("categories", [])

    # This is where you could add more specific parsers for different tasks
    # For example, for object detection:
    # object_detection_summary = parse_object_detection(annotations_data)

    return {
        "info": info,
        "licenses": licenses,
        "num_images": len(images),
        "num_annotations": len(annotations_data),
        "num_categories": len(categories),
    }
