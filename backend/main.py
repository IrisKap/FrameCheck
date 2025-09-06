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

app = FastAPI(title="FrameCheck API", description="AI-powered photo composition analysis")

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
    2. Saves it temporarily 
    3. Loads it with Pillow and converts to OpenCV format
    4. Gets basic image dimensions
    5. Returns confirmation that processing has started
    """
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read the uploaded file contents
        contents = await file.read()
        
        # Save to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        try:
            # Load image with Pillow
            pil_image = Image.open(io.BytesIO(contents))
            
            # Get image dimensions
            width, height = pil_image.size
            
            # Convert PIL image to OpenCV format (RGB to BGR)
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convert to numpy array for OpenCV
            cv_image = np.array(pil_image)
            cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGB2BGR)
            
            # Basic image info for confirmation
            image_info = {
                "filename": file.filename,
                "width": width,
                "height": height,
                "channels": cv_image.shape[2] if len(cv_image.shape) == 3 else 1,
                "temp_path": temp_file_path,
                "status": "Image received and processed successfully"
            }
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            
            return JSONResponse(content={
                "success": True,
                "message": "Image analysis started",
                "image_info": image_info
            })
            
        except Exception as e:
            # Clean up temp file if processing fails
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
