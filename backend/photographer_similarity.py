"""
Photographer Similarity Module

This module provides functionality to find similar photographers based on uploaded images
using CLIP embeddings and cosine similarity.
"""

import json
import numpy as np
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from typing import List, Dict, Tuple, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class PhotographerSimilarityFinder:
    def __init__(self, embeddings_file: str = "style_embeddings.json", model_name: str = "openai/clip-vit-base-patch32"):
        """
        Initialize the photographer similarity finder.
        
        Args:
            embeddings_file (str): Path to the JSON file containing photographer embeddings
            model_name (str): Hugging Face model identifier for CLIP
        """
        self.embeddings_file = embeddings_file
        self.model_name = model_name
        
        # Load embeddings
        self.photographer_embeddings = self._load_embeddings()
        
        # Initialize CLIP model
        self._initialize_clip_model()
        
        logger.info(f"PhotographerSimilarityFinder initialized with {len(self.photographer_embeddings)} photographers")
    
    def _load_embeddings(self) -> Dict[str, List[List[float]]]:
        """Load photographer embeddings from JSON file."""
        try:
            with open(self.embeddings_file, 'r') as f:
                embeddings = json.load(f)
            logger.info(f"Loaded embeddings for {len(embeddings)} photographers")
            return embeddings
        except FileNotFoundError:
            logger.error(f"Embeddings file not found: {self.embeddings_file}")
            return {}
        except Exception as e:
            logger.error(f"Error loading embeddings: {e}")
            return {}
    
    def _initialize_clip_model(self):
        """Initialize the CLIP model and processor."""
        try:
            logger.info(f"Loading CLIP model: {self.model_name}")
            self.model = CLIPModel.from_pretrained(self.model_name)
            self.processor = CLIPProcessor.from_pretrained(self.model_name)
            
            # Set device
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(self.device)
            
            logger.info(f"CLIP model loaded on device: {self.device}")
        except Exception as e:
            logger.error(f"Failed to initialize CLIP model: {e}")
            raise
    
    def generate_image_embedding(self, image: Image.Image) -> Optional[np.ndarray]:
        """
        Generate CLIP embedding for a single image.
        
        Args:
            image (PIL.Image): Input image
            
        Returns:
            numpy.ndarray: Image embedding or None if failed
        """
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Process image with CLIP processor
            inputs = self.processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate embedding
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                # Normalize the features
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                embedding = image_features.cpu().numpy().flatten()
            
            return embedding
            
        except Exception as e:
            logger.warning(f"Failed to generate embedding: {e}")
            return None
    
    def calculate_cosine_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Args:
            embedding1 (np.ndarray): First embedding
            embedding2 (np.ndarray): Second embedding
            
        Returns:
            float: Cosine similarity score (0-1)
        """
        # Ensure embeddings are normalized
        embedding1 = embedding1 / np.linalg.norm(embedding1)
        embedding2 = embedding2 / np.linalg.norm(embedding2)
        
        # Calculate cosine similarity
        similarity = np.dot(embedding1, embedding2)
        return float(similarity)
    
    def find_similar_photographers(self, user_embeddings: List[np.ndarray], top_k: int = 3) -> List[Dict[str, any]]:
        """
        Find the most similar photographers based on user image embeddings.
        
        Args:
            user_embeddings (List[np.ndarray]): List of user image embeddings
            top_k (int): Number of top similar photographers to return
            
        Returns:
            List[Dict]: List of similar photographers with scores
        """
        if not user_embeddings or not self.photographer_embeddings:
            return []
        
        photographer_scores = {}
        
        # Calculate average similarity for each photographer
        for photographer_name, photographer_emb_list in self.photographer_embeddings.items():
            total_similarity = 0
            valid_comparisons = 0
            
            # Convert photographer embeddings to numpy arrays
            photographer_embeddings = [np.array(emb) for emb in photographer_emb_list]
            
            # Compare each user embedding with each photographer embedding
            for user_emb in user_embeddings:
                for photog_emb in photographer_embeddings:
                    similarity = self.calculate_cosine_similarity(user_emb, photog_emb)
                    total_similarity += similarity
                    valid_comparisons += 1
            
            if valid_comparisons > 0:
                avg_similarity = total_similarity / valid_comparisons
                photographer_scores[photographer_name] = {
                    'name': photographer_name,
                    'similarity_score': avg_similarity,
                    'sample_size': len(photographer_emb_list)
                }
        
        # Sort by similarity score and return top_k
        sorted_photographers = sorted(
            photographer_scores.values(),
            key=lambda x: x['similarity_score'],
            reverse=True
        )
        
        return sorted_photographers[:top_k]
    
    def process_user_images(self, images: List[Image.Image]) -> Tuple[List[np.ndarray], List[str]]:
        """
        Process multiple user images and generate embeddings.
        
        Args:
            images (List[PIL.Image]): List of user images
            
        Returns:
            Tuple[List[np.ndarray], List[str]]: Embeddings and any error messages
        """
        embeddings = []
        errors = []
        
        for i, image in enumerate(images):
            try:
                embedding = self.generate_image_embedding(image)
                if embedding is not None:
                    embeddings.append(embedding)
                else:
                    errors.append(f"Failed to process image {i+1}")
            except Exception as e:
                errors.append(f"Error processing image {i+1}: {str(e)}")
        
        return embeddings, errors
    
    def get_photographer_info(self, photographer_name: str) -> Dict[str, any]:
        """
        Get information about a photographer.
        
        Args:
            photographer_name (str): Name of the photographer
            
        Returns:
            Dict: Photographer information
        """
        # Format photographer name for display
        display_name = photographer_name.replace('_', ' ').title()
        
        # Get sample count
        sample_count = len(self.photographer_embeddings.get(photographer_name, []))
        
        # Add some basic info about each photographer
        photographer_descriptions = {
            'alex_webb': 'Street photographer known for complex, layered compositions with vibrant colors and cultural juxtapositions.',
            'andreas_gursky': 'Contemporary photographer famous for large-scale, digitally manipulated images of modern landscapes and architecture.',
            'ansel_adams': 'Legendary landscape photographer known for dramatic black and white images of the American West.',
            'dorothea_langa': 'Documentary photographer who captured the human condition during the Great Depression.',
            'georgy_crewdson': 'Fine art photographer known for cinematic, staged scenes that explore suburban life and American culture.',
            'henri_cartier_bresson': 'Pioneer of street photography and master of the "decisive moment" in candid photography.',
            'joel_meyerowitz': 'Street and landscape photographer known for his use of color and large format photography.',
            'maria_svarbova': 'Contemporary photographer known for minimalist, geometric compositions with pastel colors.',
            'pieter_hugo': 'South African photographer known for powerful portraits that explore social and political themes.',
            'yousuf_karsh': 'Portrait photographer who captured iconic images of 20th century figures and celebrities.'
        }
        
        return {
            'name': display_name,
            'original_name': photographer_name,
            'description': photographer_descriptions.get(photographer_name, 'Professional photographer with a distinctive visual style.'),
            'sample_count': sample_count
        }
