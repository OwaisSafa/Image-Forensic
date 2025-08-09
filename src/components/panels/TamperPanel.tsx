import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface TamperData {
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
}

interface TamperPanelProps {
  data: TamperData;
}

const TamperPanel: React.FC<TamperPanelProps> = ({ data }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-red-400';
    if (confidence > 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence > 0.7) return <AlertTriangle className="w-5 h-5" />;
    if (confidence > 0.4) return <Info className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence > 0.7) return 'High likelihood of tampering';
    if (confidence > 0.4) return 'Possible signs of modification';
    return 'Low probability of tampering';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Tamper Detection Analysis</h3>
      </div>

      {/* Overall Confidence */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white">Overall Assessment</h4>
          <div className={`flex items-center gap-2 ${getConfidenceColor(data.confidence)}`}>
            {getConfidenceIcon(data.confidence)}
            <span className="font-semibold">{(data.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
          <motion.div
            className={`h-2 rounded-full ${
              data.confidence > 0.7 ? 'bg-red-500' : 
              data.confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        
        <p className={`text-sm ${getConfidenceColor(data.confidence)}`}>
          {getConfidenceText(data.confidence)}
        </p>
      </motion.div>

      {/* Technical Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <h4 className="font-medium text-white mb-3">Technical Indicators</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-purple-200/70 text-sm">Compression Artifacts:</span>
            <div className={`flex items-center gap-2 ${data.compressionArtifacts ? 'text-yellow-400' : 'text-green-400'}`}>
              {data.compressionArtifacts ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{data.compressionArtifacts ? 'Detected' : 'Not Detected'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-purple-200/70 text-sm">Double JPEG Compression:</span>
            <div className={`flex items-center gap-2 ${data.doubleJpeg ? 'text-yellow-400' : 'text-green-400'}`}>
              {data.doubleJpeg ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{data.doubleJpeg ? 'Detected' : 'Not Detected'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ELA Visualization */}
      {data.elaImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <h4 className="font-medium text-white mb-3">Error Level Analysis (ELA)</h4>
          <div className="rounded-lg overflow-hidden bg-black/20">
            <img 
              src={data.elaImage} 
              alt="ELA Analysis" 
              className="w-full h-auto"
            />
          </div>
          <p className="text-sm text-purple-200/70 mt-2">
            Bright areas in the ELA image may indicate recent modifications or compression differences
          </p>
        </motion.div>
      )}

      {/* Suspicious Regions */}
      {data.regions && data.regions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <h4 className="font-medium text-white mb-3">Suspicious Regions</h4>
          <div className="space-y-2">
            {data.regions.map((region, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                <span className="text-purple-200/70 text-sm">
                  Region {index + 1} ({region.width}×{region.height})
                </span>
                <span className={`text-sm font-medium ${getConfidenceColor(region.confidence)}`}>
                  {(region.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default TamperPanel;