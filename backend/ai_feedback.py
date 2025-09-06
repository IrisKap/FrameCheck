import os
from openai import OpenAI
from typing import Dict, Any, Optional
import json

class PhotographyFeedbackGenerator:
    """
    AI-powered photography feedback generator using OpenAI GPT-4.
    Generates human-readable composition analysis and improvement tips.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the feedback generator.
        
        Args:
            api_key: OpenAI API key. If None, will try to get from environment variable.
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not provided. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
        
        self.client = OpenAI(api_key=self.api_key)
    
    def generate_feedback(self, analysis_results: Dict[str, Any], filename: str = "uploaded image") -> Dict[str, Any]:
        """
        Generate AI-powered photography feedback based on computer vision analysis.
        
        Args:
            analysis_results: Results from computer vision analysis
            filename: Name of the analyzed image
            
        Returns:
            Dictionary containing AI-generated feedback and tips
        """
        try:
            # Extract analysis data
            rule_of_thirds = analysis_results.get("rule_of_thirds", {})
            leading_lines = analysis_results.get("leading_lines", {})
            
            # Build detailed prompt
            prompt = self._build_analysis_prompt(rule_of_thirds, leading_lines, filename)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert photography instructor and composition analyst. You provide constructive, encouraging, and educational feedback to help photographers improve their skills. Your responses should be friendly, specific, and actionable."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            # Parse response
            feedback_text = response.choices[0].message.content
            
            # Structure the feedback
            structured_feedback = self._parse_feedback(feedback_text)
            
            return {
                "success": True,
                "feedback": structured_feedback,
                "raw_feedback": feedback_text,
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "feedback": self._get_fallback_feedback(analysis_results),
                "raw_feedback": None,
                "tokens_used": 0
            }
    
    def _build_analysis_prompt(self, rule_of_thirds: Dict, leading_lines: Dict, filename: str) -> str:
        """Build a detailed prompt for AI analysis based on CV results."""
        
        # Rule of thirds analysis
        rot_follows = rule_of_thirds.get("follows_rule_of_thirds", False)
        subject_detected = rule_of_thirds.get("subject_center") is not None
        distance = rule_of_thirds.get("distance_to_intersection", 0)
        
        # Leading lines analysis
        total_lines = leading_lines.get("total_lines", 0)
        diagonal_lines = leading_lines.get("diagonal_lines", 0)
        corner_lines = leading_lines.get("corner_lines", 0)
        has_strong_lines = leading_lines.get("has_strong_leading_lines", False)
        
        prompt = f"""
Analyze this photography composition for "{filename}" and provide constructive feedback:

COMPOSITION ANALYSIS:
Rule of Thirds:
- Subject follows rule of thirds: {"Yes" if rot_follows else "No"}
- Subject detected: {"Yes" if subject_detected else "No"}
- Distance from nearest intersection: {distance:.1f} pixels

Leading Lines:
- Total lines detected: {total_lines}
- Diagonal lines: {diagonal_lines}
- Corner-originating lines: {corner_lines}
- Strong leading lines present: {"Yes" if has_strong_lines else "No"}

Please provide:
1. A brief overall assessment (2-3 sentences)
2. What works well in this composition (1-2 specific points)
3. Suggestions for improvement (2-3 actionable tips)
4. One advanced technique to try next time

Keep the tone encouraging and educational. Focus on practical advice that a photographer can apply immediately.
"""
        
        return prompt.strip()
    
    def _parse_feedback(self, feedback_text: str) -> Dict[str, str]:
        """Parse the AI feedback into structured components."""
        
        # Simple parsing - in a production app, you might want more sophisticated parsing
        sections = {
            "overall_assessment": "",
            "what_works_well": "",
            "suggestions": "",
            "advanced_technique": ""
        }
        
        lines = feedback_text.split('\n')
        current_section = "overall_assessment"
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Try to identify sections
            if "works well" in line.lower() or "strengths" in line.lower():
                current_section = "what_works_well"
                continue
            elif "suggest" in line.lower() or "improve" in line.lower() or "recommendation" in line.lower():
                current_section = "suggestions"
                continue
            elif "advanced" in line.lower() or "next time" in line.lower() or "technique" in line.lower():
                current_section = "advanced_technique"
                continue
            
            # Add content to current section
            if sections[current_section]:
                sections[current_section] += " " + line
            else:
                sections[current_section] = line
        
        # If parsing failed, put everything in overall assessment
        if not any(sections.values()):
            sections["overall_assessment"] = feedback_text
        
        return sections
    
    def _get_fallback_feedback(self, analysis_results: Dict[str, Any]) -> Dict[str, str]:
        """Provide fallback feedback when AI service is unavailable."""
        
        rule_of_thirds = analysis_results.get("rule_of_thirds", {})
        leading_lines = analysis_results.get("leading_lines", {})
        
        # Generate basic feedback based on analysis
        overall = "I've analyzed your image composition using computer vision techniques."
        
        strengths = []
        suggestions = []
        
        # Rule of thirds feedback
        if rule_of_thirds.get("follows_rule_of_thirds", False):
            strengths.append("Your main subject is well-positioned according to the rule of thirds.")
        else:
            suggestions.append("Try positioning your main subject along the rule of thirds grid lines or at intersection points for more dynamic composition.")
        
        # Leading lines feedback
        if leading_lines.get("has_strong_leading_lines", False):
            strengths.append(f"Great use of leading lines! I detected {leading_lines.get('diagonal_lines', 0)} diagonal lines that help guide the viewer's eye.")
        else:
            suggestions.append("Look for natural or architectural lines that can lead the viewer's eye toward your main subject.")
        
        if not strengths:
            strengths.append("Your image shows good technical execution.")
        
        if not suggestions:
            suggestions.append("Continue experimenting with different compositions and perspectives.")
        
        return {
            "overall_assessment": overall,
            "what_works_well": " ".join(strengths),
            "suggestions": " ".join(suggestions),
            "advanced_technique": "Try using the golden ratio instead of rule of thirds, or experiment with symmetrical compositions for a different visual impact."
        }
    
    def test_connection(self) -> bool:
        """Test if the OpenAI API connection is working."""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            return True
        except Exception:
            return False
