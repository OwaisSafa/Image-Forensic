// import React from 'react';
import { motion } from 'framer-motion';
import ImageUpload from './components/ImageUpload';
import ForensicsReport from './components/ForensicsReport';
import { useForensics } from './hooks/useForensics';
import { Microscope, Shield, Eye, Users } from 'lucide-react';

function App() {
  const { 
    isAnalyzing, 
    results, 
    uploadedImage, 
    analyzeImage, 
    resetAnalysis,
    sessionId 
  } = useForensics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header 
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg backdrop-blur-sm">
              <Microscope className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Image Forensics Tool
            </h1>
          </div>
          <p className="text-purple-200/80 text-lg">
            Advanced image analysis and tamper detection with automatic reverse search
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm text-purple-200/60">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Privacy-first design</span>
            </div>

            {sessionId && (
              <div className="flex items-center gap-2 text-purple-300">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Session: {sessionId.substring(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {!uploadedImage ? (
          <ImageUpload 
            onImageUpload={analyzeImage}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <ForensicsReport 
            image={uploadedImage}
            results={results}
            isAnalyzing={isAnalyzing}
            onReset={resetAnalysis}
            sessionId={sessionId}
          />
        )}
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default App;