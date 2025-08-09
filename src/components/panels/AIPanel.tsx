import React from 'react';
import { motion } from 'framer-motion';
import { Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AIAnalysisData {
  confidence: number;
  isAiGenerated: boolean;
  model?: string;
  indicators: string[];
  analysis: string;
}

interface AIPanelProps {
  data: AIAnalysisData;
}

const AIPanel: React.FC<AIPanelProps> = ({ data }) => {
  const getConfidenceColor = (confidence: number, isAI: boolean) => {
    if (isAI && confidence > 0.7) return 'text-red-400';
    if (isAI && confidence > 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getConfidenceIcon = (confidence: number, isAI: boolean) => {
    if (isAI && confidence > 0.7) return <AlertTriangle className="w-5 h-5" />;
    if (isAI && confidence > 0.4) return <Info className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getConfidenceText = (confidence: number, isAI: boolean) => {
    if (isAI) {
      if (confidence > 0.7) return 'High confidence AI-generated';
      if (confidence > 0.4) return 'Possibly AI-generated';
      return 'Low confidence AI-generated';
    }
    return 'Likely authentic photograph';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">AI Generation Analysis</h3>
      </div>

      {/* Overall Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white">Detection Result</h4>
          <div className={`flex items-center gap-2 ${getConfidenceColor(data.confidence, data.isAiGenerated)}`}>
            {getConfidenceIcon(data.confidence, data.isAiGenerated)}
            <span className="font-semibold">{(data.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
          <motion.div
            className={`h-2 rounded-full ${
              data.isAiGenerated && data.confidence > 0.7 ? 'bg-red-500' : 
              data.isAiGenerated && data.confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence * 100}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        
        <p className={`text-sm ${getConfidenceColor(data.confidence, data.isAiGenerated)}`}>
          {getConfidenceText(data.confidence, data.isAiGenerated)}
        </p>
      </motion.div>

      {/* Model Information */}
      {data.model && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <h4 className="font-medium text-white mb-3">Detected Model</h4>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-purple-200">{data.model}</span>
          </div>
        </motion.div>
      )}

      {/* AI Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <h4 className="font-medium text-white mb-3">Detection Indicators</h4>
        <div className="space-y-2">
          {data.indicators.map((indicator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2 text-sm"
            >
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-purple-200/80">{indicator}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

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

      {/* AI Generation Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <h4 className="font-medium text-white mb-3">Common AI Patterns</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            'Inconsistent lighting',
            'Unusual texture patterns',
            'Anatomical inconsistencies',
            'Repetitive background elements',
            'Unnaturally smooth surfaces',
            'Inconsistent shadows'
          ].map((pattern, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              <span className="text-purple-200/70">{pattern}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AIPanel;