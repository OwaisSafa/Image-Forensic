export interface ForensicsResults {
  metadata: {
    camera?: string;
    lens?: string;
    settings?: {
      iso?: number;
      aperture?: number;
      shutterSpeed?: string;
      focalLength?: number;
    };
    timestamp?: string;
    gps?: {
      latitude?: number;
      longitude?: number;
    };
    software?: string;
    [key: string]: any;
  };
  tamper: {
    confidence: number;
    elaImage?: string;
    compressionArtifacts: boolean;
    doubleJpeg: boolean;
    analysis: string;
    regions?: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      confidence: number;
    }>;
  };
  aiAnalysis: {
    confidence: number;
    isAiGenerated: boolean;
    model?: string;
    indicators: string[];
    analysis: string;
  };
  faceAnalysis: {
    count: number;
    faces: Array<{
      id: string;
      confidence: number;
      age?: number;
      gender?: string;
      emotion?: string;
      landmarks?: Array<{ x: number; y: number }>;
      bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
    analysis: string;
  };
  fileInfo: {
    filename: string;
    size: string;
    type: string;
    dimensions: {
      width: number;
      height: number;
    };
    hash: string;
    created?: string;
    modified?: string;
    colorSpace?: string;
    bitDepth?: number;
    compression?: string;
  };
  // Enhanced reverse search support
  imageId?: string;
  publicImageUrl?: string;
  sessionId?: string;
  expiresAt?: number;
}