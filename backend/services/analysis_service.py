import json
import exifread
from PIL import Image
import numpy as np
import cv2
import torch
import sys
import os
import insightface
from insightface.app import FaceAnalysis
from transformers import pipeline
import logging
from typing import Dict, Any
from pathlib import Path

# Add TruFor model lib to sys.path for import
TRUFOR_LIB = Path(__file__).parent.parent / "models" / "tamper_detection" / "models" / "TruFor" / "TruFor_train_test"
sys.path.insert(0, str(TRUFOR_LIB))

from lib.config import config, update_config
from lib.utils import get_model
from dataset.dataset_test import TestDataset
from torch.nn import functional as F
from addict import Dict as AttrDict

logger = logging.getLogger(__name__)

class AnalysisService:
    """Service class for performing forensic analysis on images."""
    
    def __init__(self):
        self.face_app = None
        self.ai_pipeline = None
        self.emotion_pipeline = None
        self.trufor_model = None
        self.trufor_device = None
        self.trufor_config = None
        
        print("[DEBUG] AnalysisService __init__ called. Initializing models...")
        logger.info("[DEBUG] AnalysisService __init__ called. Initializing models...")
        self._initialize_models()
        print("[DEBUG] All models initialized successfully.")
        logger.info("[DEBUG] All models initialized successfully.")
    
    def _initialize_models(self):
        """Initialize all models once during startup."""
        try:
            print("[DEBUG] Initializing AI detection model...")
            logger.info("[DEBUG] Initializing AI detection model...")
            device = 0 if torch.cuda.is_available() else -1
            from config.settings import AI_ANALYSIS_PATH
            if AI_ANALYSIS_PATH.exists():
                model_path = str(AI_ANALYSIS_PATH)
                print(f"[DEBUG] Using local AI model: {model_path}")
                logger.info(f"[DEBUG] Using local AI model: {model_path}")
                self.ai_pipeline = pipeline("image-classification", model=model_path, device=device)
            else:
                print("[DEBUG] Downloading AI model...")
                logger.info("[DEBUG] Downloading AI model...")
                self.ai_pipeline = pipeline("image-classification", model="Organika/sdxl-detector", device=device)
            print("[DEBUG] AI detection model initialized.")
            logger.info("[DEBUG] AI detection model initialized.")
            
            print("[DEBUG] Initializing face detection model...")
            logger.info("[DEBUG] Initializing face detection model...")
            import onnxruntime as ort
            available_providers = ort.get_available_providers()
            
            if 'CUDAExecutionProvider' in available_providers:
                providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
                print("[DEBUG] GPU acceleration available for face detection")
                logger.info("[DEBUG] GPU acceleration available for face detection")
            else:
                providers = ['CPUExecutionProvider']
                print("[DEBUG] Running face detection on CPU")
                logger.info("[DEBUG] Running face detection on CPU")
                
            self.face_app = FaceAnalysis(providers=providers)
            print("[DEBUG] Preparing InsightFace model...")
            logger.info("[DEBUG] Preparing InsightFace model...")
            self.face_app.prepare(ctx_id=0, det_size=(640, 640))
            print("[DEBUG] Face detection model initialized.")
            logger.info("[DEBUG] Face detection model initialized.")
            
            print("[DEBUG] Initializing emotion detection model...")
            logger.info("[DEBUG] Initializing emotion detection model...")
            device = 0 if torch.cuda.is_available() else -1
            print("[DEBUG] Using basic emotion detection based on facial features...")
            logger.info("[DEBUG] Using basic emotion detection based on facial features...")
            self.emotion_pipeline = None
            
            print("[DEBUG] Initializing TruFor model...")
            logger.info("[DEBUG] Initializing TruFor model...")
            args = AttrDict()
            args.gpu = 0 if torch.cuda.is_available() else -1
            args.experiment = 'trufor_ph3'
            model_path = TRUFOR_LIB / 'pretrained_models' / 'trufor.pth.tar'
            args.opts = ['TEST.MODEL_FILE', str(model_path)]

            # Temporarily change CWD to TRUFOR_LIB
            original_cwd = os.getcwd()
            os.chdir(TRUFOR_LIB)
            update_config(config, args)
            os.chdir(original_cwd)

            self.trufor_device = f'cuda:{args.gpu}' if args.gpu >= 0 else 'cpu'
            self.trufor_config = config

            # Load TruFor model with optimizations
            self.trufor_model = get_model(config)
            checkpoint = torch.load(str(model_path), map_location=torch.device(self.trufor_device), weights_only=False)
            self.trufor_model.load_state_dict(checkpoint['state_dict'])
            self.trufor_model = self.trufor_model.to(self.trufor_device)
            self.trufor_model.eval()
            
            # CPU optimizations
            if self.trufor_device == 'cpu':
                # Enable optimizations for CPU inference
                torch.set_num_threads(4)  # Use 4 CPU threads
                torch.backends.cudnn.benchmark = False
                # JIT compilation for faster inference
                try:
                    self.trufor_model = torch.jit.optimize_for_inference(torch.jit.script(self.trufor_model))
                    print("[DEBUG] TruFor model JIT optimized for CPU")
                except Exception as e:
                    print(f"[DEBUG] JIT optimization failed, using standard model: {e}")
            
            print("[DEBUG] TruFor model initialized.")
            logger.info("[DEBUG] TruFor model initialized.")
            
        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())

    def extract_exif(self, image_path: str) -> Dict[str, Any]:
        """Extracts EXIF metadata from an image file."""
        logger.info("Extracting EXIF data...")
        try:
            with open(image_path, 'rb') as f:
                tags = exifread.process_file(f)
            
            metadata = {}
            for tag, value in tags.items():
                if tag not in ('JPEGThumbnail', 'TIFFThumbnail'):
                    metadata[tag] = str(value)
            
            print(f"[DEBUG] EXIF extraction completed. Found {len(metadata)} tags")
            logger.info(f"[DEBUG] EXIF extraction completed. Found {len(metadata)} tags")
            
            if metadata:
                print(f"[DEBUG] EXIF tags: {list(metadata.keys())}")
                logger.info(f"[DEBUG] EXIF tags: {list(metadata.keys())}")
                return {"exif_data": metadata}
            else:
                print("[DEBUG] No EXIF data found in image")
                logger.info("[DEBUG] No EXIF data found in image")
                # Return helpful message when no EXIF data is found
                return {
                    "exif_data": {},
                    "message": "No EXIF data found. This is common for images from social media, screenshots, or web downloads where metadata has been stripped for privacy.",
                    "suggestion": "Try uploading an image directly from a digital camera or smartphone camera app."
                }
                    
        except Exception as e:
            logger.error(f"Error extracting EXIF data: {str(e)}")
            return {"exif_data": {"error": str(e)}}

    def detect_tampering(self, image_path: str) -> Dict[str, Any]:
        """Detects image tampering using the TruFor model."""
        try:
            print("[DEBUG] detect_tampering called for image: " + image_path)
            logger.info(f"[DEBUG] detect_tampering called for image: {image_path}")
            if self.trufor_model is None:
                return {
                    "tamper_detection": {
                        "error": "TruFor model not initialized.",
                        "details": "Model failed to load during startup."
                    }
                }

            # Prepare Dataset with optimizations
            test_dataset = TestDataset(list_img=[image_path])
            test_loader = torch.utils.data.DataLoader(
                test_dataset, 
                batch_size=1, 
                num_workers=0,  # Single worker for CPU
                pin_memory=False  # Disable pin_memory for CPU
            )

            # Run Inference using pre-loaded model with optimizations
            print("[DEBUG] TruFor inference running...")
            logger.info("[DEBUG] TruFor inference running...")
            
            # Set inference mode and disable gradients
            self.trufor_model.eval()
            with torch.no_grad():
                for rgb, _ in test_loader:
                    rgb = rgb.to(self.trufor_device)
                    
                    # Optimize input tensor
                    if self.trufor_device == 'cpu':
                        rgb = rgb.contiguous()  # Ensure contiguous memory layout
                    
                    pred, conf, det, _ = self.trufor_model(rgb, save_np=False)

                    if det is not None:
                        score = torch.sigmoid(det).item()
                    else:
                        score = -1

                    pred_map = torch.squeeze(pred, 0)
                    pred_map = F.softmax(pred_map, dim=0)[1].cpu().numpy()

                    return {
                        "integrity_score": score,
                        "localization_map_shape": pred_map.shape
                    }
        except Exception as e:
            import traceback
            logger.error(f"TruFor analysis failed: {str(e)}")
            return {
                "tamper_detection": {
                    "error": "Failed to run TruFor tamper detection.",
                    "details": str(e),
                    "trace": traceback.format_exc()
                }
            }

    def detect_ai_generation(self, image_path: str) -> Dict[str, Any]:
        """Detects if an image is AI-generated using Hugging Face model."""
        try:
            logger.info(f"Analyzing {image_path} for AI generation...")
            
            if self.ai_pipeline is None:
                return {
                    "ai_detection": {
                        "error": "AI detection model not initialized.",
                        "details": "Model failed to load during startup."
                    }
                }

            # Run inference using pre-loaded pipeline
            logger.info("Running AI detection inference...")
            results = self.ai_pipeline(image_path)

            # Process results
            ai_score = 0.0
            for result in results:
                if result['label'] == 'artificial':
                    ai_score = result['score']
                    break
            
            is_ai_generated = ai_score > 0.5
            confidence = ai_score if is_ai_generated else 1 - ai_score

            return {
                "ai_detection": {
                    "is_ai_generated": is_ai_generated,
                    "confidence_score": round(confidence, 4),
                    "raw_score_for_ai": round(ai_score, 4)
                }
            }

        except Exception as e:
            import traceback
            logger.error(f"AI detection failed: {str(e)}")
            return {
                "ai_detection": {
                    "error": "Failed to run Hugging Face AI detection.",
                    "details": str(e),
                    "trace": traceback.format_exc()
                }
            }

    def detect_faces(self, image_path: str) -> Dict[str, Any]:
        """Detects faces, age, gender, emotion, and keypoints using InsightFace and emotion classification."""
        try:
            if self.face_app is None:
                return {
                    "face_detection": {
                        "error": "Face detection model not initialized.",
                        "details": "Model failed to load during startup."
                    }
                }

            # Read the image
            img = cv2.imread(image_path)
            if img is None:
                return {"face_detection": {"error": "Could not read image file."}}

            # Detect faces using pre-loaded model
            logger.info("Running face detection...")
            faces = self.face_app.get(img)

            # Process the results
            face_results = []
            for i, face in enumerate(faces):
                # Extract face region for emotion analysis
                bbox = face.bbox.astype(int)
                x1, y1, x2, y2 = bbox
                
                # Ensure coordinates are within image bounds
                h, w = img.shape[:2]
                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(w, x2)
                y2 = min(h, y2)
                
                # Extract face crop for emotion analysis
                face_crop = img[y1:y2, x1:x2]
                
                # Basic facial expression analysis based on keypoints
                emotion_result = self._analyze_facial_expression(face, face_crop, image_path, i)
                
                # Get gender with better error handling
                gender = "Unknown"
                try:
                    if hasattr(face, 'gender_name') and face.gender_name:
                        gender = face.gender_name
                    elif hasattr(face, 'gender') and face.gender is not None:
                        gender = "Male" if face.gender == 1 else "Female"
                    else:
                        gender = "Unknown"
                except Exception as e:
                    logger.warning(f"Gender detection failed for face {i}: {str(e)}")
                    gender = "Unknown"
                
                # Get age with better error handling
                age = "Unknown"
                try:
                    if hasattr(face, 'age') and face.age is not None:
                        age = face.age
                    else:
                        age = "Unknown"
                except Exception as e:
                    logger.warning(f"Age detection failed for face {i}: {str(e)}")
                    age = "Unknown"
                
                face_data = {
                    "face_id": i + 1,
                    "bounding_box": [int(x) for x in face.bbox.tolist()],
                    "confidence": float(face.det_score),
                    "age": age,
                    "gender": gender,
                    "emotion": emotion_result,
                    "keypoints": {f"point_{j}": [int(pt[0]), int(pt[1])] for j, pt in enumerate(face.kps.tolist())}
                }
                face_results.append(face_data)

            return {
                "face_detection": {
                    "count": len(face_results),
                    "faces": face_results
                }
            }
        except Exception as e:
            import traceback
            logger.error(f"Face detection failed: {str(e)}")
            return {
                "face_detection": {
                    "error": "An error occurred during face analysis.",
                    "details": str(e),
                    "trace": traceback.format_exc()
                }
            }

    def _analyze_facial_expression(self, face, face_crop, image_path, face_index) -> Dict[str, Any]:
        """Analyze facial expression based on facial keypoints and features."""
        try:
            kps = face.kps
            print(f"[DEBUG] Face {face_index} - Keypoints shape: {kps.shape if kps is not None else 'None'}")
            logger.info(f"[DEBUG] Face {face_index} - Keypoints shape: {kps.shape if kps is not None else 'None'}")
            
            if kps is not None and len(kps) >= 5:
                print(f"[DEBUG] Face {face_index} - Processing {len(kps)} keypoints")
                logger.info(f"[DEBUG] Face {face_index} - Processing {len(kps)} keypoints")
                
                # InsightFace uses 5-point landmarks: left_eye, right_eye, nose, left_mouth, right_mouth
                # But let's be more flexible and use the first 5 keypoints
                if len(kps) >= 5:
                    # Use the first 5 keypoints for analysis
                    keypoints = kps[:5]
                    
                    # Calculate distances between keypoints for emotion analysis
                    # Use a more robust approach
                    try:
                        # Calculate various facial measurements
                        measurements = []
                        for i in range(len(keypoints)):
                            for j in range(i+1, len(keypoints)):
                                dist = np.linalg.norm(keypoints[i] - keypoints[j])
                                measurements.append(dist)
                        
                        if measurements:
                            avg_distance = np.mean(measurements)
                            max_distance = np.max(measurements)
                            min_distance = np.min(measurements)
                            
                            # Simple emotion classification based on facial proportions
                            if max_distance > avg_distance * 1.5:
                                emotion = "happy"
                                confidence = 0.7
                            elif min_distance < avg_distance * 0.5:
                                emotion = "sad"
                                confidence = 0.6
                            else:
                                emotion = "neutral"
                                confidence = 0.8
                            
                            print(f"[DEBUG] Face {face_index} - Emotion: {emotion}, Confidence: {confidence}")
                            logger.info(f"[DEBUG] Face {face_index} - Emotion: {emotion}, Confidence: {confidence}")
                            
                            return {
                                "emotion": emotion,
                                "confidence": confidence,
                                "method": "keypoint_analysis",
                                "features": {
                                    "avg_distance": float(avg_distance),
                                    "max_distance": float(max_distance),
                                    "min_distance": float(min_distance),
                                    "keypoint_count": len(keypoints)
                                }
                            }
                        else:
                            return {"emotion": "neutral", "confidence": 0.5, "method": "no_measurements"}
                    except Exception as e:
                        print(f"[DEBUG] Face {face_index} - Measurement calculation failed: {e}")
                        logger.warning(f"Face {face_index} - Measurement calculation failed: {e}")
                        return {"emotion": "neutral", "confidence": 0.5, "method": "measurement_failed"}
                else:
                    print(f"[DEBUG] Face {face_index} - Insufficient keypoints: {len(kps)}")
                    logger.warning(f"Face {face_index} - Insufficient keypoints: {len(kps)}")
                    return {"emotion": "neutral", "confidence": 0.5, "method": "insufficient_keypoints"}
            else:
                print(f"[DEBUG] Face {face_index} - No keypoints available")
                logger.warning(f"Face {face_index} - No keypoints available")
                return {"emotion": "neutral", "confidence": 0.5, "method": "no_keypoints"}
            
        except Exception as e:
            print(f"[DEBUG] Face {face_index} - Facial expression analysis failed: {str(e)}")
            logger.warning(f"Facial expression analysis failed: {str(e)}")
            return {"emotion": "neutral", "confidence": 0.5, "method": "failed"}

    def analyze(self, image_path: str) -> Dict[str, Any]:
        """Performs a full forensic analysis of an image."""
        logger.info(f"Starting full forensic analysis for {image_path}...")
        results = {}
        
        # 1. Extract EXIF data
        results.update(self.extract_exif(image_path))
        
        # 2. Detect tampering
        tamper_results = self.detect_tampering(image_path)
        results['tamper_detection'] = tamper_results

        # 3. Detect AI generation
        ai_results = self.detect_ai_generation(image_path)
        results['ai_detection'] = ai_results

        # 4. Detect faces
        face_results = self.detect_faces(image_path)
        results['face_detection'] = face_results
        
        logger.info("Forensic analysis completed")
        return results

# Global instance
analysis_service = AnalysisService() 