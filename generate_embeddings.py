#!/usr/bin/env python3
"""
Image Embedding Generator using Hugging Face CLIP Model

This script processes images organized by photographer and generates embeddings
using the CLIP model, saving the results to a JSON file.

Dependencies:
    pip install torch torchvision Pillow numpy transformers

Usage:
    python generate_embeddings.py
"""

import os
import json
import numpy as np
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageEmbeddingGenerator:
    def __init__(self, model_name="openai/clip-vit-base-patch32"):
        """
        Initialize the CLIP model and processor.
        
        Args:
            model_name (str): Hugging Face model identifier for CLIP
        """
        logger.info(f"Loading CLIP model: {model_name}")
        
        # Load the CLIP model and processor
        self.model = CLIPModel.from_pretrained(model_name)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        
        # Set device (GPU if available, otherwise CPU)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        
        logger.info(f"Model loaded on device: {self.device}")
        
        # Supported image extensions
        self.supported_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.JPG', '.JPEG', '.PNG', '.WEBP', '.AVIF'}
    
    def load_and_process_image(self, image_path):
        """
        Load and process an image for CLIP embedding generation.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            torch.Tensor: Processed image tensor or None if failed
        """
        try:
            # Load image with PIL
            image = Image.open(image_path).convert('RGB')
            
            # Process image with CLIP processor
            inputs = self.processor(images=image, return_tensors="pt")
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            return inputs
            
        except Exception as e:
            logger.warning(f"Failed to process image {image_path}: {str(e)}")
            return None
    
    def generate_embedding(self, image_path):
        """
        Generate CLIP embedding for a single image.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            numpy.ndarray: Image embedding as numpy array or None if failed
        """
        try:
            # Load and process image
            inputs = self.load_and_process_image(image_path)
            if inputs is None:
                return None
            
            # Generate embedding
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                
                # Normalize the features
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                
                # Convert to numpy array
                embedding = image_features.cpu().numpy().flatten()
                
            return embedding
            
        except Exception as e:
            logger.warning(f"Failed to generate embedding for {image_path}: {str(e)}")
            return None
    
    def process_photographer_folder(self, photographer_path):
        """
        Process all images in a photographer's folder.
        
        Args:
            photographer_path (Path): Path to photographer's folder
            
        Returns:
            list: List of embeddings for all successfully processed images
        """
        photographer_name = photographer_path.name
        embeddings = []
        
        # Get all image files in the folder
        image_files = []
        for file_path in photographer_path.iterdir():
            if file_path.is_file() and file_path.suffix in self.supported_extensions:
                image_files.append(file_path)
        
        logger.info(f"Processing: {photographer_name} ({len(image_files)} images found)")
        
        # Process each image
        for i, image_path in enumerate(image_files, 1):
            logger.info(f"  Processing image {i}/{len(image_files)}: {image_path.name}")
            
            embedding = self.generate_embedding(str(image_path))
            if embedding is not None:
                embeddings.append(embedding.tolist())  # Convert to list for JSON serialization
            else:
                logger.warning(f"  Skipped {image_path.name} due to processing error")
        
        logger.info(f"  Successfully processed {len(embeddings)}/{len(image_files)} images for {photographer_name}")
        return embeddings
    
    def generate_all_embeddings(self, root_folder="backend/photographers"):
        """
        Generate embeddings for all photographers in the root folder.
        
        Args:
            root_folder (str): Path to the photographers root folder
            
        Returns:
            dict: Dictionary with photographer names as keys and embeddings as values
        """
        root_path = Path(root_folder)
        
        if not root_path.exists():
            raise FileNotFoundError(f"Root folder not found: {root_folder}")
        
        style_embeddings = {}
        
        # Get all photographer folders
        photographer_folders = [folder for folder in root_path.iterdir() if folder.is_dir()]
        
        if not photographer_folders:
            logger.warning(f"No photographer folders found in {root_folder}")
            return style_embeddings
        
        logger.info(f"Found {len(photographer_folders)} photographer folders")
        
        # Process each photographer
        for photographer_path in photographer_folders:
            try:
                embeddings = self.process_photographer_folder(photographer_path)
                if embeddings:  # Only add if we have embeddings
                    style_embeddings[photographer_path.name] = embeddings
                else:
                    logger.warning(f"No embeddings generated for {photographer_path.name}")
                    
            except Exception as e:
                logger.error(f"Error processing {photographer_path.name}: {str(e)}")
                continue
        
        return style_embeddings
    
    def save_embeddings(self, embeddings, output_file="style_embeddings.json"):
        """
        Save embeddings to a JSON file.
        
        Args:
            embeddings (dict): Dictionary of embeddings to save
            output_file (str): Output file path
        """
        try:
            with open(output_file, 'w') as f:
                json.dump(embeddings, f, indent=2)
            
            logger.info(f"Embeddings saved to {output_file}")
            
            # Print summary
            total_embeddings = sum(len(emb_list) for emb_list in embeddings.values())
            logger.info(f"Summary: {len(embeddings)} photographers, {total_embeddings} total embeddings")
            
        except Exception as e:
            logger.error(f"Failed to save embeddings: {str(e)}")
            raise


def main():
    """Main function to run the embedding generation process."""
    try:
        # Initialize the generator
        generator = ImageEmbeddingGenerator()
        
        # Generate embeddings
        logger.info("Starting embedding generation process...")
        style_embeddings = generator.generate_all_embeddings()
        
        if not style_embeddings:
            logger.error("No embeddings were generated. Please check your input folder.")
            return
        
        # Save embeddings
        generator.save_embeddings(style_embeddings)
        
        logger.info("Embedding generation completed successfully!")
        
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        raise


if __name__ == "__main__":
    main()
