import cv2
import numpy as np
from typing import Tuple, List, Dict, Any
import base64

class CompositionAnalyzer:
    """
    Computer vision analyzer for photography composition analysis.
    Implements Rule of Thirds and Leading Lines detection.
    """
    
    def __init__(self):
        self.analysis_results = {}
    
    def analyze_rule_of_thirds(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Analyze image for Rule of Thirds composition.
        
        Args:
            image: OpenCV image (BGR format)
            
        Returns:
            Dictionary containing rule of thirds analysis results
        """
        height, width = image.shape[:2]
        
        # Calculate grid line positions
        third_width = width // 3
        third_height = height // 3
        
        # Grid line coordinates
        vertical_lines = [third_width, 2 * third_width]
        horizontal_lines = [third_height, 2 * third_height]
        
        # Intersection points (rule of thirds points)
        intersection_points = []
        for v_line in vertical_lines:
            for h_line in horizontal_lines:
                intersection_points.append((v_line, h_line))
        
        # Create image with grid overlay
        grid_image = image.copy()
        
        # Draw vertical lines
        for x in vertical_lines:
            cv2.line(grid_image, (x, 0), (x, height), (0, 255, 0), 2)
        
        # Draw horizontal lines
        for y in horizontal_lines:
            cv2.line(grid_image, (0, y), (width, y), (0, 255, 0), 2)
        
        # Draw intersection points
        for point in intersection_points:
            cv2.circle(grid_image, point, 8, (0, 0, 255), -1)
        
        # Detect subject/areas of interest using saliency
        subject_analysis = self._detect_subject_areas(image, intersection_points)
        
        return {
            "grid_lines": {
                "vertical": vertical_lines,
                "horizontal": horizontal_lines
            },
            "intersection_points": intersection_points,
            "subject_analysis": subject_analysis,
            "grid_image": grid_image,
            "dimensions": {"width": width, "height": height}
        }
    
    def _detect_subject_areas(self, image: np.ndarray, intersection_points: List[Tuple[int, int]]) -> Dict[str, Any]:
        """
        Detect subject areas using edge detection and contour analysis instead of saliency.
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Use adaptive threshold to find prominent areas
            thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 2)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Filter contours by area (remove very small ones)
                min_area = (image.shape[0] * image.shape[1]) * 0.01  # 1% of image area
                significant_contours = [c for c in contours if cv2.contourArea(c) > min_area]
                
                if significant_contours:
                    # Find the largest contour (main subject)
                    largest_contour = max(significant_contours, key=cv2.contourArea)
                    
                    # Get centroid of main subject
                    M = cv2.moments(largest_contour)
                    if M["m00"] != 0:
                        subject_center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))
                        
                        # Find closest intersection point
                        min_distance = float('inf')
                        closest_point = None
                        
                        for point in intersection_points:
                            distance = np.sqrt((subject_center[0] - point[0])**2 + (subject_center[1] - point[1])**2)
                            if distance < min_distance:
                                min_distance = distance
                                closest_point = point
                        
                        # Determine if subject follows rule of thirds
                        threshold = min(image.shape[:2]) * 0.15  # 15% of smaller dimension
                        follows_rule = min_distance < threshold
                        
                        return {
                            "subject_center": subject_center,
                            "closest_intersection": closest_point,
                            "distance_to_intersection": min_distance,
                            "follows_rule_of_thirds": follows_rule,
                            "threshold": threshold
                        }
        
        except Exception as e:
            print(f"Error in subject detection: {e}")
        
        # Fallback: use image center as subject
        height, width = image.shape[:2]
        image_center = (width // 2, height // 2)
        
        # Find closest intersection point to center
        min_distance = float('inf')
        closest_point = None
        
        for point in intersection_points:
            distance = np.sqrt((image_center[0] - point[0])**2 + (image_center[1] - point[1])**2)
            if distance < min_distance:
                min_distance = distance
                closest_point = point
        
        threshold = min(image.shape[:2]) * 0.15
        follows_rule = min_distance < threshold
        
        return {
            "subject_center": image_center,
            "closest_intersection": closest_point,
            "distance_to_intersection": min_distance,
            "follows_rule_of_thirds": follows_rule,
            "threshold": threshold
        }
    
    def analyze_leading_lines(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Analyze image for leading lines using edge detection and Hough transform.
        
        Args:
            image: OpenCV image (BGR format)
            
        Returns:
            Dictionary containing leading lines analysis results
        """
        height, width = image.shape[:2]
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Edge detection using Canny
        edges = cv2.Canny(blurred, 50, 150, apertureSize=3)
        
        # Detect lines using Probabilistic Hough Transform
        lines = cv2.HoughLinesP(
            edges,
            rho=1,              # Distance resolution in pixels
            theta=np.pi/180,    # Angular resolution in radians
            threshold=100,      # Minimum votes
            minLineLength=100,  # Minimum line length
            maxLineGap=10       # Maximum gap between line segments
        )
        
        # Create image with detected lines
        lines_image = image.copy()
        leading_lines = []
        
        if lines is not None:
            # Filter and analyze lines
            for line in lines:
                x1, y1, x2, y2 = line[0]
                
                # Calculate line properties
                length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
                angle = np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi
                
                # Filter for significant lines
                if length > min(width, height) * 0.2:  # At least 20% of smaller dimension
                    line_info = {
                        "start": (x1, y1),
                        "end": (x2, y2),
                        "length": length,
                        "angle": angle,
                        "is_diagonal": abs(angle) > 15 and abs(angle) < 75,
                        "originates_from_corner": self._check_corner_origin(x1, y1, width, height)
                    }
                    leading_lines.append(line_info)
                    
                    # Draw line on image
                    color = (255, 0, 0) if line_info["is_diagonal"] else (0, 255, 255)
                    cv2.line(lines_image, (x1, y1), (x2, y2), color, 3)
        
        # Analyze line quality
        diagonal_lines = [line for line in leading_lines if line["is_diagonal"]]
        corner_lines = [line for line in leading_lines if line["originates_from_corner"]]
        
        return {
            "total_lines": len(leading_lines) if leading_lines else 0,
            "diagonal_lines": len(diagonal_lines),
            "corner_lines": len(corner_lines),
            "leading_lines": leading_lines,
            "lines_image": lines_image,
            "edges_image": edges,
            "has_strong_leading_lines": len(diagonal_lines) >= 2 or len(corner_lines) >= 1
        }
    
    def _check_corner_origin(self, x: int, y: int, width: int, height: int) -> bool:
        """Check if a point originates from or near a corner of the image."""
        corner_threshold = 0.1  # 10% of dimension
        
        near_left = x < width * corner_threshold
        near_right = x > width * (1 - corner_threshold)
        near_top = y < height * corner_threshold
        near_bottom = y > height * (1 - corner_threshold)
        
        # Check if near any corner
        return (near_left or near_right) and (near_top or near_bottom)
    
    def create_analysis_overlay(self, image: np.ndarray, rule_of_thirds: Dict, leading_lines: Dict) -> np.ndarray:
        """
        Create a combined overlay showing both rule of thirds and leading lines analysis.
        """
        overlay = image.copy()
        
        # Add rule of thirds grid
        height, width = image.shape[:2]
        
        # Draw grid lines (semi-transparent)
        grid_overlay = overlay.copy()
        
        # Vertical lines
        for x in rule_of_thirds["grid_lines"]["vertical"]:
            cv2.line(grid_overlay, (x, 0), (x, height), (0, 255, 0), 2)
        
        # Horizontal lines
        for y in rule_of_thirds["grid_lines"]["horizontal"]:
            cv2.line(grid_overlay, (0, y), (width, y), (0, 255, 0), 2)
        
        # Intersection points
        for point in rule_of_thirds["intersection_points"]:
            cv2.circle(grid_overlay, point, 8, (0, 0, 255), -1)
        
        # Blend grid with original image
        overlay = cv2.addWeighted(overlay, 0.7, grid_overlay, 0.3, 0)
        
        # Add leading lines
        if leading_lines["leading_lines"]:
            for line in leading_lines["leading_lines"]:
                x1, y1 = line["start"]
                x2, y2 = line["end"]
                color = (255, 0, 0) if line["is_diagonal"] else (0, 255, 255)
                cv2.line(overlay, (x1, y1), (x2, y2), color, 3)
        
        # Highlight subject center if detected
        subject_analysis = rule_of_thirds["subject_analysis"]
        if subject_analysis["subject_center"]:
            cv2.circle(overlay, subject_analysis["subject_center"], 12, (255, 255, 0), 3)
        
        return overlay
    
    def image_to_base64(self, image: np.ndarray) -> str:
        """Convert OpenCV image to base64 string for frontend display."""
        _, buffer = cv2.imencode('.jpg', image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{image_base64}"
