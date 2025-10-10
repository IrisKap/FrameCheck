"""
Image Deskew and Auto-Crop Module

This module provides functionality to automatically deskew images based on leading lines
and suggest optimal crops while keeping the subject in frame.
"""

import cv2
import numpy as np
from typing import Tuple, List, Dict, Optional
import logging
import base64

logger = logging.getLogger(__name__)

class ImageDeskewer:
    def __init__(self):
        """Initialize the image deskewer."""
        self.logger = logging.getLogger(__name__)
    
    def detect_leading_lines(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect prominent leading lines in the image.
        
        Args:
            image (np.ndarray): Input image in BGR format
            
        Returns:
            List[Tuple[int, int, int, int]]: List of line endpoints (x1, y1, x2, y2)
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply Canny edge detection
            edges = cv2.Canny(blurred, 50, 150, apertureSize=3)
            
            # Detect lines using Probabilistic Hough Transform
            lines = cv2.HoughLinesP(
                edges, 
                rho=1, 
                theta=np.pi/180, 
                threshold=100, 
                minLineLength=50, 
                maxLineGap=10
            )
            
            if lines is None:
                return []
            
            # Filter lines to get only the most prominent ones
            filtered_lines = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                # Calculate line length
                length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
                # Only keep lines that are reasonably long
                if length > 80:
                    filtered_lines.append((x1, y1, x2, y2))
            
            return filtered_lines
            
        except Exception as e:
            self.logger.error(f"Error detecting leading lines: {e}")
            return []
    
    def calculate_rotation_angle(self, lines: List[Tuple[int, int, int, int]]) -> float:
        """
        Calculate the average rotation angle from detected lines.
        
        Args:
            lines (List[Tuple[int, int, int, int]]): List of line endpoints
            
        Returns:
            float: Average rotation angle in degrees
        """
        if not lines:
            return 0.0
        
        angles = []
        for x1, y1, x2, y2 in lines:
            # Calculate angle in radians
            angle_rad = np.arctan2(y2 - y1, x2 - x1)
            # Convert to degrees
            angle_deg = np.degrees(angle_rad)
            # Normalize to -90 to 90 degrees
            if angle_deg > 90:
                angle_deg -= 180
            elif angle_deg < -90:
                angle_deg += 180
            angles.append(angle_deg)
        
        # Calculate median angle (more robust than mean)
        median_angle = np.median(angles)
        
        # Check if the image is already well-aligned
        # If most lines are close to 0° (horizontal) or 90° (vertical), don't rotate
        horizontal_lines = sum(1 for angle in angles if abs(angle) < 15)  # Within 15° of horizontal
        vertical_lines = sum(1 for angle in angles if abs(angle - 90) < 15 or abs(angle + 90) < 15)  # Within 15° of vertical
        total_lines = len(angles)
        
        # If more than 60% of lines are already aligned (horizontal or vertical), don't rotate
        if (horizontal_lines + vertical_lines) / total_lines > 0.6:
            return 0.0
        
        # Only apply rotation if the angle is significant (> 2 degrees) and not a major rotation
        if abs(median_angle) < 2.0:
            return 0.0
        
        # Don't apply major rotations (90°, 180°, 270°) as they're likely unnecessary
        if abs(median_angle) > 45 and abs(median_angle) < 135:
            return 0.0
        
        return -median_angle  # Negative to correct the image
    
    def rotate_image(self, image: np.ndarray, angle: float) -> np.ndarray:
        """
        Rotate the image by the specified angle.
        
        Args:
            image (np.ndarray): Input image
            angle (float): Rotation angle in degrees
            
        Returns:
            np.ndarray: Rotated image
        """
        if abs(angle) < 0.1:
            return image.copy()
        
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        
        # Get rotation matrix
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        
        # Calculate new dimensions to avoid cropping
        cos = np.abs(rotation_matrix[0, 0])
        sin = np.abs(rotation_matrix[0, 1])
        new_w = int((h * sin) + (w * cos))
        new_h = int((h * cos) + (w * sin))
        
        # Adjust rotation matrix for new dimensions
        rotation_matrix[0, 2] += (new_w / 2) - center[0]
        rotation_matrix[1, 2] += (new_h / 2) - center[1]
        
        # Apply rotation
        rotated = cv2.warpAffine(
            image, 
            rotation_matrix, 
            (new_w, new_h), 
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )
        
        return rotated
    
    def find_convergence_point(self, lines: List[Tuple[int, int, int, int]]) -> Optional[Tuple[int, int]]:
        """
        Find the convergence point of leading lines.
        
        Args:
            lines (List[Tuple[int, int, int, int]]): List of line endpoints
            
        Returns:
            Optional[Tuple[int, int]]: Convergence point (x, y) or None
        """
        if len(lines) < 2:
            return None
        
        try:
            # Find intersections of line pairs
            intersections = []
            for i in range(len(lines)):
                for j in range(i + 1, len(lines)):
                    x1, y1, x2, y2 = lines[i]
                    x3, y3, x4, y4 = lines[j]
                    
                    # Calculate intersection point
                    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
                    if abs(denom) > 1e-10:  # Avoid division by zero
                        t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
                        u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
                        
                        if 0 <= t <= 1 and 0 <= u <= 1:
                            # Intersection is within both line segments
                            ix = int(x1 + t * (x2 - x1))
                            iy = int(y1 + t * (y2 - y1))
                            intersections.append((ix, iy))
            
            if not intersections:
                return None
            
            # Return the average of all intersections
            avg_x = int(np.mean([p[0] for p in intersections]))
            avg_y = int(np.mean([p[1] for p in intersections]))
            
            return (avg_x, avg_y)
            
        except Exception as e:
            self.logger.error(f"Error finding convergence point: {e}")
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
    
    def find_best_crop(self, image: np.ndarray, convergence_point: Optional[Tuple[int, int]], 
                      subject_center: Optional[Tuple[int, int]] = None) -> Tuple[int, int, int, int]:
        """
        Find the best crop box based on convergence point and subject location.
        
        Args:
            image (np.ndarray): Input image
            convergence_point (Optional[Tuple[int, int]]): Convergence point of leading lines
            subject_center (Optional[Tuple[int, int]]): Subject center from previous analysis
            
        Returns:
            Tuple[int, int, int, int]: Crop box (x1, y1, x2, y2)
        """
        h, w = image.shape[:2]
        
        # Use convergence point or subject center as the focal point
        focal_point = convergence_point or subject_center
        
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
    
    def process_image(self, image: np.ndarray, subject_center: Optional[Tuple[int, int]] = None) -> Dict:
        """
        Process image for deskewing and cropping.
        
        Args:
            image (np.ndarray): Input image in BGR format
            subject_center (Optional[Tuple[int, int]]): Subject center from previous analysis
            
        Returns:
            Dict: Processing results including rotated and cropped images
        """
        try:
            # Step 1: Detect leading lines
            lines = self.detect_leading_lines(image)
            
            # Step 2: Calculate rotation angle
            rotation_angle = self.calculate_rotation_angle(lines)
            
            # Step 3: Rotate image
            rotated_image = self.rotate_image(image, rotation_angle)
            
            # Step 4: Find convergence point
            convergence_point = self.find_convergence_point(lines)
            
            # Step 5: Calculate best crop
            crop_box = self.find_best_crop(rotated_image, convergence_point, subject_center)
            
            # Step 6: Apply crop
            final_image = self.apply_crop(rotated_image, crop_box)
            
            return {
                'success': True,
                'images': {
                    'original': self.image_to_base64(image),
                    'rotated': self.image_to_base64(rotated_image),
                    'final': self.image_to_base64(final_image)
                },
                'rotation_angle': float(rotation_angle),
                'lines_detected': len(lines),
                'convergence_point': convergence_point,
                'crop_box': crop_box,
                'lines': lines
            }
            
        except Exception as e:
            self.logger.error(f"Error processing image: {e}")
            return {
                'success': False,
                'error': str(e),
                'images': {
                    'original': self.image_to_base64(image)
                }
            }
