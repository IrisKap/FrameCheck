"""
Image Crop Suggestion Module

This module provides functionality to suggest optimal crops based on composition analysis,
rule of thirds, and subject detection.
"""

import cv2
import numpy as np
from typing import Tuple, List, Dict, Optional
import logging
import base64

logger = logging.getLogger(__name__)

class ImageCropSuggester:
    def __init__(self):
        """Initialize the image crop suggester."""
        self.logger = logging.getLogger(__name__)
    
    def detect_subject_center(self, image: np.ndarray) -> Optional[Tuple[int, int]]:
        """
        Detect the center of the main subject using saliency detection.
        
        Args:
            image (np.ndarray): Input image in BGR format
            
        Returns:
            Optional[Tuple[int, int]]: Subject center (x, y) or None
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Use Laplacian to detect edges and find areas of interest
            laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
            laplacian = np.uint8(np.absolute(laplacian))
            
            # Find contours
            contours, _ = cv2.findContours(laplacian, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return None
            
            # Find the largest contour (likely the main subject)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Calculate the center of the largest contour
            M = cv2.moments(largest_contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                return (cx, cy)
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error detecting subject center: {e}")
            return None
    
    def calculate_rule_of_thirds_points(self, width: int, height: int) -> List[Tuple[int, int]]:
        """
        Calculate the four Rule of Thirds intersection points.
        
        Args:
            width (int): Image width
            height (int): Image height
            
        Returns:
            List[Tuple[int, int]]: List of intersection points (x, y)
        """
        w_third = width // 3
        h_third = height // 3
        
        return [
            (w_third, h_third),           # Top-left
            (2 * w_third, h_third),       # Top-right
            (w_third, 2 * h_third),       # Bottom-left
            (2 * w_third, 2 * h_third)    # Bottom-right
        ]
    
    def find_best_crop(self, image: np.ndarray, subject_center: Optional[Tuple[int, int]] = None) -> Tuple[int, int, int, int]:
        """
        Find the best crop box based on subject location and rule of thirds.
        
        Args:
            image (np.ndarray): Input image
            subject_center (Optional[Tuple[int, int]]): Subject center from previous analysis
            
        Returns:
            Tuple[int, int, int, int]: Crop box (x1, y1, x2, y2)
        """
        h, w = image.shape[:2]
        
        # Use provided subject center or detect it
        focal_point = subject_center
        if focal_point is None:
            focal_point = self.detect_subject_center(image)
        
        if focal_point is None:
            # Default to center crop
            crop_size = min(w, h) * 0.8
            x1 = int((w - crop_size) // 2)
            y1 = int((h - crop_size) // 2)
            x2 = int(x1 + crop_size)
            y2 = int(y1 + crop_size)
            return (x1, y1, x2, y2)
        
        fx, fy = focal_point
        
        # Get Rule of Thirds points
        rule_of_thirds = self.calculate_rule_of_thirds_points(w, h)
        
        # Find closest Rule of Thirds point to focal point
        distances = [np.sqrt((fx - px)**2 + (fy - py)**2) for px, py in rule_of_thirds]
        closest_idx = np.argmin(distances)
        target_x, target_y = rule_of_thirds[closest_idx]
        
        # Calculate crop box to place focal point at target position
        crop_size = min(w, h) * 0.75  # 75% of the smaller dimension
        
        # Calculate crop box center
        crop_center_x = fx + (target_x - fx) * 0.3  # Adjust positioning
        crop_center_y = fy + (target_y - fy) * 0.3
        
        # Calculate crop box bounds
        x1 = max(0, int(crop_center_x - crop_size // 2))
        y1 = max(0, int(crop_center_y - crop_size // 2))
        x2 = min(w, int(x1 + crop_size))
        y2 = min(h, int(y1 + crop_size))
        
        # Adjust if crop goes out of bounds
        if x2 - x1 < crop_size * 0.8:
            x1 = max(0, x2 - int(crop_size))
        if y2 - y1 < crop_size * 0.8:
            y1 = max(0, y2 - int(crop_size))
        
        return (x1, y1, x2, y2)
    
    def apply_crop(self, image: np.ndarray, crop_box: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Apply crop to the image.
        
        Args:
            image (np.ndarray): Input image
            crop_box (Tuple[int, int, int, int]): Crop box (x1, y1, x2, y2)
            
        Returns:
            np.ndarray: Cropped image
        """
        x1, y1, x2, y2 = crop_box
        return image[y1:y2, x1:x2]
    
    def image_to_base64(self, image: np.ndarray) -> str:
        """
        Convert OpenCV image to base64 string.
        
        Args:
            image (np.ndarray): OpenCV image in BGR format
            
        Returns:
            str: Base64 encoded image string
        """
        try:
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Encode as JPEG
            _, buffer = cv2.imencode('.jpg', rgb_image, [cv2.IMWRITE_JPEG_QUALITY, 90])
            
            # Convert to base64
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return f"data:image/jpeg;base64,{img_base64}"
            
        except Exception as e:
            self.logger.error(f"Error converting image to base64: {e}")
            return ""
    
    def suggest_crop(self, image: np.ndarray, subject_center: Optional[Tuple[int, int]] = None) -> Dict:
        """
        Suggest optimal crop for the image.
        
        Args:
            image (np.ndarray): Input image in BGR format
            subject_center (Optional[Tuple[int, int]]): Subject center from previous analysis
            
        Returns:
            Dict: Crop suggestion results
        """
        try:
            # Detect subject center if not provided
            detected_subject = self.detect_subject_center(image)
            final_subject_center = subject_center or detected_subject
            
            # Calculate best crop
            crop_box = self.find_best_crop(image, final_subject_center)
            
            # Apply crop
            cropped_image = self.apply_crop(image, crop_box)
            
            # Get Rule of Thirds points for visualization
            h, w = image.shape[:2]
            rule_of_thirds_points = self.calculate_rule_of_thirds_points(w, h)
            
            return {
                'success': True,
                'images': {
                    'original': self.image_to_base64(image),
                    'cropped': self.image_to_base64(cropped_image)
                },
                'crop_box': crop_box,
                'subject_center': final_subject_center,
                'rule_of_thirds_points': rule_of_thirds_points,
                'crop_ratio': (crop_box[2] - crop_box[0]) / (crop_box[3] - crop_box[1])
            }
            
        except Exception as e:
            self.logger.error(f"Error suggesting crop: {e}")
            return {
                'success': False,
                'error': str(e),
                'images': {
                    'original': self.image_to_base64(image)
                }
            }
