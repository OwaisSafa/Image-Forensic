import { useState, useCallback, useRef } from 'react';
import { ForensicsResults } from '../types/forensics';

export const useForensics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ForensicsResults | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Get API base URL based on environment
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // In browser
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:8000'; // Python FastAPI backend
      }
      // Production - use same origin
      return window.location.origin;
    }
    return 'http://localhost:8000'; // Python FastAPI backend
  };

  const analyzeImage = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setUploadedImage(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file); // Python FastAPI expects 'file' not 'image'
      
      const apiUrl = `${getApiBaseUrl()}/api/v1/analyze`; // Updated FastAPI endpoint
      console.log('Sending request to Python FastAPI backend:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // No need for custom headers for FastAPI
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store session ID for future requests
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
        console.log('Session ID stored:', data.session_id.substring(0, 8) + '...');
      }
      
      console.log('Python FastAPI analysis completed successfully:', data);
      
      // Transform Python FastAPI response to match frontend expectations
      const transformedResults = transformPythonResponse(data, file);
      setResults(transformedResults);
      
    } catch (error) {
      console.error('Python FastAPI analysis error:', error);
      
      // Show user-friendly error message
      let message = 'Analysis failed.';
      if (error instanceof Error) {
        message = `Analysis failed: ${error.message}`;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // @ts-ignore
        message = `Analysis failed: ${error.message}`;
      }
      alert(`${message}\n\nPlease check if the Python FastAPI backend is running on port 8000.`);
      
      // Don't set mock data - let the user see the real error
      setResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Transform Python FastAPI response to match frontend expectations
  const transformPythonResponse = (pythonData: any, file: File): ForensicsResults => {
    console.log('Raw Python data:', pythonData);
        
    // Extract the actual results from the nested structure
    const results = pythonData.results || {};
    
    // Extract EXIF data with better handling
    const exifData = results.exif_data || {};
    const hasExifData = Object.keys(exifData).length > 0 && !exifData.error;
    const exifMessage = results.message;
    const exifSuggestion = results.suggestion;
    
    console.log('EXIF data from backend:', exifData);
    console.log('EXIF message:', exifMessage);
    console.log('Has EXIF data:', hasExifData);
    
    return {
          metadata: {
        camera: hasExifData ? (exifData.Make || exifData['Image Make'] || 'Unknown') : 'No EXIF data',
        lens: hasExifData ? (exifData.Model || exifData['Image Model'] || 'Unknown') : 'No EXIF data',
            settings: {
          iso: hasExifData ? (exifData.ISO || exifData['EXIF ISOSpeedRatings'] || 'Unknown') : 'No EXIF data',
          aperture: hasExifData ? (exifData.FNumber || exifData['EXIF FNumber'] || 'Unknown') : 'No EXIF data',
          shutterSpeed: hasExifData ? (exifData.ExposureTime || exifData['EXIF ExposureTime'] || 'Unknown') : 'No EXIF data',
          focalLength: hasExifData ? (exifData.FocalLength || exifData['EXIF FocalLength'] || 'Unknown') : 'No EXIF data'
            },
        timestamp: hasExifData ? (exifData.DateTimeOriginal || exifData['EXIF DateTimeOriginal'] || exifData.DateTime || 'Unknown') : 'No EXIF data',
        software: hasExifData ? (exifData.Software || 'Unknown') : 'No EXIF data',
        // Add additional EXIF data
        orientation: hasExifData ? (exifData['Image Orientation'] || 'Unknown') : 'No EXIF data',
        resolution: {
          x: hasExifData ? (exifData['Image XResolution'] || 'Unknown') : 'No EXIF data',
          y: hasExifData ? (exifData['Image YResolution'] || 'Unknown') : 'No EXIF data'
        },
        // Add helpful messages when no EXIF data is found
        message: exifMessage,
        suggestion: exifSuggestion,
        dimensions: {
          width: hasExifData ? parseInt(exifData['EXIF ExifImageWidth'] || exifData['Image ImageWidth'] || '0') : 0,
          height: hasExifData ? parseInt(exifData['EXIF ExifImageLength'] || exifData['Image ImageLength'] || '0') : 0
        }
          },
          tamper: {
        confidence: results.tamper_detection?.integrity_score || 0,
            compressionArtifacts: false,
            doubleJpeg: false,
        analysis: results.tamper_detection?.error || 
          `Tamper detection completed. Integrity score: ${(results.tamper_detection?.integrity_score || 0).toFixed(3)}`
          },
          aiAnalysis: {
        confidence: results.ai_detection?.ai_detection?.confidence_score || 0,
        isAiGenerated: results.ai_detection?.ai_detection?.is_ai_generated || false,
        indicators: results.ai_detection?.ai_detection?.error ? 
          ['Analysis failed'] : 
          [results.ai_detection?.ai_detection?.is_ai_generated ? 'AI generated content detected' : 'Natural image detected'],
        analysis: results.ai_detection?.ai_detection?.error || 
          `AI detection completed. ${results.ai_detection?.ai_detection?.is_ai_generated ? 'AI generated' : 'Natural'} image with ${(results.ai_detection?.ai_detection?.confidence_score || 0).toFixed(3)} confidence.`
          },
          faceAnalysis: {
        count: results.face_detection?.face_detection?.count || 0,
        faces: results.face_detection?.face_detection?.faces?.map((face: any, index: number) => {
          console.log(`Face ${index + 1} data:`, face);
          console.log(`Face ${index + 1} emotion:`, face.emotion);
          return {
            id: `face_${index + 1}`,
            confidence: face.confidence || 0,
            age: face.age || 'Unknown',
            gender: face.gender || 'Unknown',
            emotion: face.emotion?.emotion || 'Unknown',
            bbox: {
              x: face.bounding_box?.[0] || 0,
              y: face.bounding_box?.[1] || 0,
              width: (face.bounding_box?.[2] || 0) - (face.bounding_box?.[0] || 0),
              height: (face.bounding_box?.[3] || 0) - (face.bounding_box?.[1] || 0)
            }
          };
        }) || [],
        analysis: results.face_detection?.face_detection?.error || 
          `Face detection completed. Found ${results.face_detection?.face_detection?.count || 0} face(s).`
          },
          fileInfo: {
            filename: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type,
        dimensions: { 
          width: hasExifData ? parseInt(exifData['EXIF ExifImageWidth'] || exifData['Image ImageWidth'] || '0') : 0, 
          height: hasExifData ? parseInt(exifData['EXIF ExifImageLength'] || exifData['Image ImageLength'] || '0') : 0 
        },
        hash: pythonData.image_id || 'unknown',
        colorSpace: hasExifData ? (exifData['EXIF ColorSpace'] || 'Unknown') : 'No EXIF data',
            bitDepth: 8,
        compression: 'Unknown'
          },
      imageId: pythonData.image_id || 'unknown',
      publicImageUrl: `${getApiBaseUrl()}/image/${pythonData.image_id}`,
      sessionId: pythonData.session_id || sessionIdRef.current,
          expiresAt: Date.now() + (60 * 60 * 1000)
    };
  };

  const resetAnalysis = useCallback(() => {
    setResults(null);
    setUploadedImage(null);
    setIsAnalyzing(false);
    // Keep session ID for potential future uploads
  }, []);

  return {
    isAnalyzing,
    results,
    uploadedImage,
    analyzeImage,
    resetAnalysis,
    sessionId: sessionIdRef.current
  };
};