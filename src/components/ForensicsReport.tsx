import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Info, Search, Clock } from 'lucide-react';
import { ForensicsResults } from '../types/forensics';
import MetadataPanel from './panels/MetadataPanel';
import TamperPanel from './panels/TamperPanel';
import AIPanel from './panels/AIPanel';
import FacePanel from './panels/FacePanel';
import FileInfoPanel from './panels/FileInfoPanel';
import ImagePreview from './ImagePreview';

interface ForensicsReportProps {
  image: File;
  results: ForensicsResults | null;
  isAnalyzing: boolean;
  onReset: () => void;
  sessionId?: string | null;
}

const ForensicsReport: React.FC<ForensicsReportProps> = ({ 
  image, 
  results, 
  isAnalyzing, 
  onReset,
  sessionId 
}) => {
  const [activeTab, setActiveTab] = useState('metadata');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<string | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const tabs = [
    { id: 'metadata', label: 'EXIF Data', icon: '📷' },
    { id: 'tamper', label: 'Tamper Detection', icon: '🔍' },
    { id: 'ai', label: 'AI Analysis', icon: '🤖' },
    { id: 'faces', label: 'Face Detection', icon: '👥' },
    { id: 'file', label: 'File Info', icon: '📁' }
  ];

  const exportReport = () => {
    if (!results) return;
    
    const reportData = {
      filename: image.name,
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      results: results
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensics-report-${image.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get API base URL
  const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8000';
    }
    return window.location.origin;
  };

  const performReverseSearch = async (engine: 'google' | 'bing' | 'yandex' | 'tineye') => {
    setSearchLoading(engine);
    
    try {
      // Use the dedicated API endpoints with session isolation
      if (results?.imageId && sessionId) {
        const response = await fetch(`${getApiBaseUrl()}/api/v1/reverse/${engine}?image_id=${results.imageId}&session_id=${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Opening ${engine} reverse search:`, data.search_url);
          
          const newWindow = window.open(data.search_url, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            // Fallback: copy URL to clipboard
            await navigator.clipboard.writeText(data.search_url);
            alert(`Popup blocked. The search URL has been copied to your clipboard:\n${data.search_url}`);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to generate ${engine} search URL`);
        }
      } else {
        // Fallback: Open search engine upload pages
        const fallbackUrls = {
          google: 'https://www.google.com/imghp?hl=en&tab=wi&authuser=0&ogbl',
          bing: 'https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP',
          yandex: 'https://yandex.com/images/',
          tineye: 'https://tineye.com/'
        };
        
        const newWindow = window.open(fallbackUrls[engine], '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          alert(`Popup blocked. Please visit: ${fallbackUrls[engine]}`);
        }
      }
      
    } catch (error) {
      console.error(`${engine} reverse search error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to initiate ${engine} reverse image search: ${errorMessage}`);
    } finally {
      setSearchLoading(null);
    }
  };

  const formatExpiryTime = (expiresAt: number) => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onReset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold text-white">Forensics Report</h2>
            <div className="flex items-center gap-4 text-purple-200/70">
              <span>{image.name}</span>
              {sessionId && (
                <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">
                  Session: {sessionId.substring(0, 8)}...
                </span>
              )}
              {results?.expiresAt && (
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{formatExpiryTime(results.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            onClick={exportReport}
            disabled={!results}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Reverse Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Automatic Reverse Image Search</h3>
          <div className={`px-2 py-1 text-xs rounded-full ${
            results?.imageId && sessionId
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {results?.imageId && sessionId ? 'READY' : 'PROCESSING'}
          </div>
        </div>
        
        <p className="text-blue-200/80 text-sm mb-4">
          {results?.imageId && sessionId
            ? 'Your image is ready for automatic reverse search. Click any search engine below to open the search with your image automatically loaded.'
            : 'Processing your image for reverse search. This will be ready once analysis completes.'
          }
        </p>
        
        {/* Search Engine Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <motion.button
            onClick={() => performReverseSearch('google')}
            disabled={searchLoading === 'google' || !results?.imageId}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: searchLoading === 'google' || !results?.imageId ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {searchLoading === 'google' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="font-medium">Google</span>
          </motion.button>
          
          <motion.button
            onClick={() => performReverseSearch('bing')}
            disabled={searchLoading === 'bing' || !results?.imageId}
            className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: searchLoading === 'bing' || !results?.imageId ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {searchLoading === 'bing' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="font-medium">Bing</span>
          </motion.button>
          
          <motion.button
            onClick={() => performReverseSearch('yandex')}
            disabled={searchLoading === 'yandex' || !results?.imageId}
            className="p-3 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: searchLoading === 'yandex' || !results?.imageId ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {searchLoading === 'yandex' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="font-medium">Yandex</span>
          </motion.button>
          
          <motion.button
            onClick={() => performReverseSearch('tineye')}
            disabled={searchLoading === 'tineye' || !results?.imageId}
            className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: searchLoading === 'tineye' || !results?.imageId ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {searchLoading === 'tineye' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="font-medium">TinEye</span>
          </motion.button>
        </div>
        

      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Preview */}
        <div className="lg:col-span-1">
          <ImagePreview imageUrl={imageUrl} imageName={image.name} />
        </div>

        {/* Analysis Tabs */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-purple-200">Analyzing image...</p>
                </div>
              </div>
            ) : results ? (
              <>
                {activeTab === 'metadata' && <MetadataPanel data={results.metadata} />}
                {activeTab === 'tamper' && <TamperPanel data={results.tamper} />}
                {activeTab === 'ai' && <AIPanel data={results.aiAnalysis} />}
                {activeTab === 'faces' && <FacePanel data={results.faceAnalysis} />}
                {activeTab === 'file' && <FileInfoPanel data={results.fileInfo} />}
              </>
            ) : (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200">No analysis data available</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForensicsReport;