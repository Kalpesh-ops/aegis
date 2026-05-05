import fitz  # PyMuPDF
from typing import List, Dict, Any
from fastapi import HTTPException
import io

def extract_structured_blocks(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extracts text blocks from a PDF while preserving spatial coordinates.
    Returns a list of dictionaries containing page_num, bbox, and text.
    """
    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF document: {str(e)}")

    extracted_blocks = []

    for page_num in range(len(document)):
        page = document[page_num]
        # dict=True extracts detailed block information including bboxes
        blocks = page.get_text("dict")["blocks"]

        for block in blocks:
            if block["type"] == 0:  # Type 0 is text (ignores images for text extraction)
                block_text = ""
                for line in block["lines"]:
                    for span in line["spans"]:
                        block_text += span["text"] + " "
                
                clean_text = block_text.strip()
                if clean_text:
                    extracted_blocks.append({
                        "page_num": page_num + 1,
                        "bbox": block["bbox"],  # [x0, y0, x1, y1] for frontend highlighting
                        "text": clean_text
                    })
    
    document.close()
    return extracted_blocks