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
from typing import Dict, Any, List, Optional
from cv_analysis import CompositionAnalyzer
from ai_feedback import PhotographyFeedbackGenerator
from photographer_similarity import PhotographerSimilarityFinder
from image_deskew import ImageDeskewer
from image_crop import ImageCropSuggester
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="FrameCheck API", description="AI-powered photo composition analysis")

# Initialize composition analyzer
analyzer = CompositionAnalyzer()

# Initialize AI feedback generator (will handle missing API key gracefully)
try:
    ai_feedback = PhotographyFeedbackGenerator()
    ai_available = ai_feedback.test_connection()
except Exception as e:
    print(f"Warning: AI feedback unavailable - {e}")
    ai_feedback = None
    ai_available = False

# Initialize services with lazy loading to save memory
similarity_finder = None
similarity_available = False
image_deskewer = None
deskew_available = False
image_crop_suggester = None
crop_available = False

def get_similarity_finder():
    global similarity_finder, similarity_available
    if similarity_finder is None and not similarity_available:
        try:
            similarity_finder = PhotographerSimilarityFinder()
            similarity_available = True
        except Exception as e:
            print(f"Warning: Photographer similarity unavailable - {e}")
            similarity_available = False
    return similarity_finder

def get_image_deskewer():
    global image_deskewer, deskew_available
    if image_deskewer is None and not deskew_available:
        try:
            image_deskewer = ImageDeskewer()
            deskew_available = True
        except Exception as e:
            print(f"Warning: Image deskew unavailable - {e}")
            deskew_available = False
    return image_deskewer

def get_image_crop_suggester():
    global image_crop_suggester, crop_available
    if image_crop_suggester is None and not crop_available:
        try:
            image_crop_suggester = ImageCropSuggester()
            crop_available = True
        except Exception as e:
            print(f"Warning: Image crop suggestion unavailable - {e}")
            crop_available = False
    return image_crop_suggester

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://framecheck.onrender.com"],  # React dev server and production
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
            
            # Generate AI feedback (always provide feedback, either from AI or fallback)
            analysis_for_ai = {
                "rule_of_thirds": rule_of_thirds_results["subject_analysis"],
                "leading_lines": {
                    "total_lines": leading_lines_results["total_lines"],
                    "diagonal_lines": leading_lines_results["diagonal_lines"],
                    "corner_lines": leading_lines_results["corner_lines"],
                    "has_strong_leading_lines": leading_lines_results["has_strong_leading_lines"]
                }
            }
            
            if ai_available and ai_feedback:
                try:
                    ai_feedback_result = ai_feedback.generate_feedback(analysis_for_ai, file.filename)
                except Exception as e:
                    print(f"AI feedback generation failed: {e}")
                    # Fallback to local feedback generation
                    fallback_generator = PhotographyFeedbackGenerator.__new__(PhotographyFeedbackGenerator)
                    ai_feedback_result = {
                        "success": False,
                        "error": str(e),
                        "feedback": fallback_generator._get_fallback_feedback(analysis_for_ai),
                        "source": "fallback"
                    }
            else:
                # Use fallback feedback when AI is not available
                print("Using fallback feedback (no OpenAI API key)")
                fallback_generator = PhotographyFeedbackGenerator.__new__(PhotographyFeedbackGenerator)
                ai_feedback_result = {
                    "success": False,
                    "error": "OpenAI API not configured",
                    "feedback": fallback_generator._get_fallback_feedback(analysis_for_ai),
                    "source": "fallback"
                }
            
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
                "ai_feedback": ai_feedback_result,
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

@app.post("/find-similar-photographers/")
async def find_similar_photographers(files: List[UploadFile] = File(...)):
    """
    Find similar photographers based on uploaded images.
    
    This endpoint:
    1. Receives up to 4 image files
    2. Generates CLIP embeddings for each image
    3. Compares with photographer style embeddings
    4. Returns the most similar photographers
    """
    
    try:
        # Validate number of files
        if len(files) > 4:
            raise HTTPException(status_code=400, detail="Maximum 4 images allowed")
        
        similarity_finder = get_similarity_finder()
        if not similarity_available or not similarity_finder:
            raise HTTPException(status_code=503, detail="Photographer similarity service unavailable")
        
        # Validate file types - be more lenient with content type checking
        for file in files:
            # Check file extension as backup if content_type is not reliable
            if file.filename:
                file_ext = file.filename.lower().split('.')[-1]
                valid_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'avif']
                if file_ext not in valid_extensions:
                    raise HTTPException(status_code=400, detail=f"File {file.filename} must be an image (supported: {', '.join(valid_extensions)})")
            elif not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File must be an image")
        
        # Process images
        images = []
        processed_files = []
        
        for file in files:
            try:
                # Read file contents
                contents = await file.read()
                
                # Load image with Pillow
                pil_image = Image.open(io.BytesIO(contents))
                
                # Convert to RGB if needed
                if pil_image.mode != 'RGB':
                    pil_image = pil_image.convert('RGB')
                
                images.append(pil_image)
                processed_files.append({
                    'filename': file.filename,
                    'size': pil_image.size,
                    'mode': pil_image.mode
                })
                
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to process {file.filename}: {str(e)}")
        
        # Generate embeddings for user images
        user_embeddings, errors = similarity_finder.process_user_images(images)
        
        if not user_embeddings:
            raise HTTPException(status_code=500, detail="Failed to generate embeddings for any images")
        
        # Find similar photographers
        similar_photographers = similarity_finder.find_similar_photographers(user_embeddings, top_k=3)
        
        # Add photographer information
        for photographer in similar_photographers:
            photographer_info = similarity_finder.get_photographer_info(photographer['name'])
            photographer.update(photographer_info)
        
        return JSONResponse(content={
            "success": True,
            "message": f"Found similar photographers for {len(user_embeddings)} images",
            "processed_files": processed_files,
            "errors": errors,
            "similar_photographers": similar_photographers,
            "total_images_processed": len(user_embeddings)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/deskew-image/")
async def deskew_image(file: UploadFile = File(...), subject_center_x: Optional[int] = None, subject_center_y: Optional[int] = None):
    """
    Deskew and auto-crop image based on leading lines detection.
    
    This endpoint:
    1. Detects leading lines in the image
    2. Calculates rotation angle needed to straighten the image
    3. Rotates the image to correct skew
    4. Finds convergence point of leading lines
    5. Suggests optimal crop while keeping subject in frame
    """
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_deskewer = get_image_deskewer()
        if not deskew_available or not image_deskewer:
            raise HTTPException(status_code=503, detail="Image deskew service unavailable")
        
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
            
            # Prepare subject center if provided
            subject_center = None
            if subject_center_x is not None and subject_center_y is not None:
                subject_center = (subject_center_x, subject_center_y)
            
            # Process image for deskewing and cropping
            result = image_deskewer.process_image(cv_image, subject_center)
            
            if not result['success']:
                raise HTTPException(status_code=500, detail=f"Deskew processing failed: {result.get('error', 'Unknown error')}")
            
            # Images are already converted to base64 in the ImageDeskewer
            
            # Create visualization of detected lines on original image
            lines_image = cv_image.copy()
            for x1, y1, x2, y2 in result['lines']:
                cv2.line(lines_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            lines_base64 = analyzer.image_to_base64(lines_image)
            
            return JSONResponse(content={
                "success": True,
                "message": "Image deskew and crop completed successfully",
                "filename": file.filename,
                "rotation_angle": float(result['rotation_angle']),
                "lines_detected": int(result['lines_detected']),
                "convergence_point": result['convergence_point'],
                "crop_box": result['crop_box'],
                "images": {
                    "original": result['images']['original'],
                    "rotated": result['images']['rotated'],
                    "final": result['images']['final'],
                    "lines": lines_base64
                },
                "processing_info": {
                    "rotation_applied": abs(result['rotation_angle']) > 0.1,
                    "crop_applied": True,
                    "subject_kept_in_frame": subject_center is not None
                }
            })
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/suggest-crop/")
async def suggest_crop(file: UploadFile = File(...), subject_center_x: Optional[int] = None, subject_center_y: Optional[int] = None):
    """
    Suggest optimal crop for the uploaded image.
    
    This endpoint:
    1. Detects the main subject in the image
    2. Calculates Rule of Thirds intersection points
    3. Suggests optimal crop to place subject at Rule of Thirds
    4. Returns original and cropped images
    """
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_crop_suggester = get_image_crop_suggester()
        if not crop_available or not image_crop_suggester:
            raise HTTPException(status_code=503, detail="Image crop suggestion service unavailable")
        
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
            
            # Prepare subject center if provided
            subject_center = None
            if subject_center_x is not None and subject_center_y is not None:
                subject_center = (subject_center_x, subject_center_y)
            
            # Suggest crop
            result = image_crop_suggester.suggest_crop(cv_image, subject_center)
            
            if not result['success']:
                raise HTTPException(status_code=500, detail=f"Crop suggestion failed: {result.get('error', 'Unknown error')}")
            
            return JSONResponse(content={
                "success": True,
                "message": "Crop suggestion completed successfully",
                "filename": file.filename,
                "crop_box": result['crop_box'],
                "subject_center": result['subject_center'],
                "rule_of_thirds_points": result['rule_of_thirds_points'],
                "crop_ratio": float(result['crop_ratio']),
                "images": {
                    "original": result['images']['original'],
                    "cropped": result['images']['cropped']
                },
                "processing_info": {
                    "subject_detected": result['subject_center'] is not None,
                    "crop_applied": True,
                    "rule_of_thirds_used": True
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
