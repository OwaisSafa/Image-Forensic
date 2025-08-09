import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Smile, Frown } from 'lucide-react';

interface FaceData {
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
}

interface FacePanelProps {
  data: FaceData;
}

const FacePanel: React.FC<FacePanelProps> = ({ data }) => {
  const getEmotionIcon = (emotion: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy':
      case 'joy':
        return <Smile className="w-4 h-4 text-green-400" />;
      case 'sad':
      case 'sadness':
        return <Frown className="w-4 h-4 text-blue-400" />;
      default:
        return <Eye className="w-4 h-4 text-purple-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-400';
    if (confidence > 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Face Detection Analysis</h3>
      </div>

      {/* Face Count Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white">Detection Summary</h4>
          <div className="flex items-center gap-2 text-purple-400">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{data.count} face{data.count !== 1 ? 's' : ''} detected</span>
          </div>
        </div>
        
        {data.count > 0 && (
          <p className="text-purple-200/80 text-sm">
            Found {data.count} face{data.count !== 1 ? 's' : ''} with varying confidence levels
          </p>
        )}
      </motion.div>

      {/* Individual Faces */}
      {data.faces.map((face, index) => (
        <motion.div
          key={face.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">Face {index + 1}</h4>
            <div className={`flex items-center gap-2 ${getConfidenceColor(face.confidence)}`}>
              <span className="text-sm font-medium">{(face.confidence * 100).toFixed(1)}% confidence</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-purple-200/70 text-sm">Position:</span>
                <span className="text-white text-sm">
                  {face.bbox.x.toFixed(0)}, {face.bbox.y.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200/70 text-sm">Size:</span>
                <span className="text-white text-sm">
                  {face.bbox.width.toFixed(0)}×{face.bbox.height.toFixed(0)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {face.age && (
                <div className="flex justify-between items-center">
                  <span className="text-purple-200/70 text-sm">Age:</span>
                  <span className="text-white text-sm">≈{face.age} years</span>
                </div>
              )}
              {face.gender && (
                <div className="flex justify-between items-center">
                  <span className="text-purple-200/70 text-sm">Gender:</span>
                  <span className="text-white text-sm">{face.gender}</span>
                </div>
              )}
              {face.emotion && (
                <div className="flex justify-between items-center">
                  <span className="text-purple-200/70 text-sm">Emotion:</span>
                  <div className="flex items-center gap-1">
                    {getEmotionIcon(face.emotion)}
                    <span className="text-white text-sm">{face.emotion}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {face.landmarks && face.landmarks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-purple-200/70 text-sm">
                {face.landmarks.length} facial landmarks detected
              </span>
            </div>
          )}
        </motion.div>
      ))}

      {/* No Faces Found */}
      {data.count === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 rounded-lg p-6 text-center"
        >
          <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-200 mb-2">No faces detected in this image</p>
          <p className="text-purple-200/70 text-sm">
            This could be due to poor lighting, image quality, or no faces being present
          </p>
        </motion.div>
      )}

      {/* Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <h4 className="font-medium text-white mb-3">Analysis Summary</h4>
        <p className="text-purple-200/80 text-sm leading-relaxed">
          {data.analysis}
        </p>
      </motion.div>

      {/* Privacy Note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 font-medium text-sm">Privacy Notice</span>
        </div>
        <p className="text-blue-200/80 text-sm">
          Face detection is performed locally. No facial data is stored or transmitted.
        </p>
      </motion.div>
    </div>
  );
};

export default FacePanel;