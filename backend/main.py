from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from PIL import Image
import io
import os
import tempfile
import base64
from typing import Dict, Any
from cv_analysis import CompositionAnalyzer

app = FastAPI(title="FrameCheck API", description="AI-powered photo composition analysis")

# Initialize composition analyzer
analyzer = CompositionAnalyzer()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "FrameCheck API is running"}

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze uploaded image for composition elements.
    
    This endpoint:
    1. Receives an image file
    2. Loads it with Pillow and converts to OpenCV format
    3. Performs Rule of Thirds analysis
    4. Performs Leading Lines detection
    5. Returns analysis results with visual overlays
    """
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read the uploaded file contents
        contents = await file.read()
        
        try:
            # Load image with Pillow
            pil_image = Image.open(io.BytesIO(contents))
            
            # Convert PIL image to OpenCV format (RGB to BGR)
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convert to numpy array for OpenCV
            cv_image = np.array(pil_image)
            cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGB2BGR)
            
            # Perform Rule of Thirds analysis
            rule_of_thirds_results = analyzer.analyze_rule_of_thirds(cv_image)
            
            # Perform Leading Lines analysis
            leading_lines_results = analyzer.analyze_leading_lines(cv_image)
            
            # Create combined analysis overlay
            analysis_overlay = analyzer.create_analysis_overlay(
                cv_image, rule_of_thirds_results, leading_lines_results
            )
            
            # Convert images to base64 for frontend display
            original_base64 = analyzer.image_to_base64(cv_image)
            overlay_base64 = analyzer.image_to_base64(analysis_overlay)
            rule_of_thirds_base64 = analyzer.image_to_base64(rule_of_thirds_results["grid_image"])
            leading_lines_base64 = analyzer.image_to_base64(leading_lines_results["lines_image"])
            
            # Prepare analysis summary (convert numpy types to Python types for JSON serialization)
            analysis_summary = {
                "rule_of_thirds": {
                    "follows_rule": bool(rule_of_thirds_results["subject_analysis"]["follows_rule_of_thirds"]),
                    "subject_detected": rule_of_thirds_results["subject_analysis"]["subject_center"] is not None,
                    "distance_to_intersection": float(rule_of_thirds_results["subject_analysis"]["distance_to_intersection"]) if rule_of_thirds_results["subject_analysis"]["distance_to_intersection"] is not None else None
                },
                "leading_lines": {
                    "total_lines": int(leading_lines_results["total_lines"]),
                    "diagonal_lines": int(leading_lines_results["diagonal_lines"]),
                    "corner_lines": int(leading_lines_results["corner_lines"]),
                    "has_strong_leading_lines": bool(leading_lines_results["has_strong_leading_lines"])
                }
            }
            
            return JSONResponse(content={
                "success": True,
                "message": "Image analysis completed successfully",
                "filename": file.filename,
                "dimensions": {
                    "width": pil_image.size[0],
                    "height": pil_image.size[1]
                },
                "analysis_summary": analysis_summary,
                "images": {
                    "original": original_base64,
                    "analysis_overlay": overlay_base64,
                    "rule_of_thirds": rule_of_thirds_base64,
                    "leading_lines": leading_lines_base64
                },
                "detailed_results": {
                    "rule_of_thirds": {
                        "grid_lines": {
                            "vertical": [int(x) for x in rule_of_thirds_results["grid_lines"]["vertical"]],
                            "horizontal": [int(y) for y in rule_of_thirds_results["grid_lines"]["horizontal"]]
                        },
                        "intersection_points": [[int(x), int(y)] for x, y in rule_of_thirds_results["intersection_points"]],
                        "subject_analysis": {
                            "subject_center": [int(rule_of_thirds_results["subject_analysis"]["subject_center"][0]), int(rule_of_thirds_results["subject_analysis"]["subject_center"][1])] if rule_of_thirds_results["subject_analysis"]["subject_center"] else None,
                            "closest_intersection": [int(rule_of_thirds_results["subject_analysis"]["closest_intersection"][0]), int(rule_of_thirds_results["subject_analysis"]["closest_intersection"][1])] if rule_of_thirds_results["subject_analysis"]["closest_intersection"] else None,
                            "distance_to_intersection": float(rule_of_thirds_results["subject_analysis"]["distance_to_intersection"]) if rule_of_thirds_results["subject_analysis"]["distance_to_intersection"] is not None else None,
                            "follows_rule_of_thirds": bool(rule_of_thirds_results["subject_analysis"]["follows_rule_of_thirds"]),
                            "threshold": float(rule_of_thirds_results["subject_analysis"]["threshold"]) if rule_of_thirds_results["subject_analysis"]["threshold"] is not None else None
                        }
                    },
                    "leading_lines": {
                        "total_lines": int(leading_lines_results["total_lines"]),
                        "diagonal_lines": int(leading_lines_results["diagonal_lines"]),
                        "has_strong_leading_lines": bool(leading_lines_results["has_strong_leading_lines"])
                    }
                }
            })
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
