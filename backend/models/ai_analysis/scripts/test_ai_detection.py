#!/usr/bin/env python3
"""
AI Analysis Test Script
Tests the AI generation detection functionality.
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from transformers import pipeline
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_ai_detection(image_path: str):
    """Test AI generation detection on a sample image."""
    try:
        logger.info(f"Testing AI detection on: {image_path}")
        
        # Initialize pipeline
        device = 0 if torch.cuda.is_available() else -1
        pipe = pipeline("image-classification", model="Organika/sdxl-detector", device=device)
        
        # Run inference
        results = pipe(image_path)
        
        # Process results
        ai_score = 0.0
        for result in results:
            if result['label'] == 'artificial':
                ai_score = result['score']
                break
        
        is_ai_generated = ai_score > 0.5
        confidence = ai_score if is_ai_generated else 1 - ai_score
        
        # Print results
        print("AI Analysis Results:")
        print("=" * 50)
        print(f"AI Generated: {is_ai_generated}")
        print(f"Confidence: {confidence:.4f}")
        print(f"Raw AI Score: {ai_score:.4f}")
        print(f"All Results: {results}")
        
        return {
            "ai_detection": {
                "is_ai_generated": is_ai_generated,
                "confidence_score": round(confidence, 4),
                "raw_score_for_ai": round(ai_score, 4)
            }
        }
        
    except Exception as e:
        logger.error(f"AI detection failed: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_ai_detection.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        sys.exit(1)
    
    results = test_ai_detection(image_path)
    print(f"\nTest completed.") 