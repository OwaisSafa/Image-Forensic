import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isAnalyzing }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please upload a valid image file';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onImageUpload(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-12"
    >
      <div className="max-w-4xl mx-auto">
        {/* Upload Area */}
        <motion.div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-purple-400 bg-purple-500/10 scale-105' 
              : 'border-purple-500/30 bg-white/5 hover:bg-white/10'
          } backdrop-blur-sm`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isAnalyzing}
          />
          
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="p-4 bg-purple-500/20 rounded-full"
              animate={{ 
                rotate: isAnalyzing ? 360 : 0,
                scale: dragActive ? 1.1 : 1 
              }}
              transition={{ 
                rotate: { duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" },
                scale: { duration: 0.2 }
              }}
            >
              {isAnalyzing ? (
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload className="w-12 h-12 text-purple-400" />
              )}
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {isAnalyzing ? 'Analyzing Image...' : 'Upload Image for Analysis'}
              </h3>
              <p className="text-purple-200/80 text-lg">
                {isAnalyzing 
                  ? 'Please wait while we perform forensic analysis'
                  : 'Drag and drop an image here, or click to select'
                }
              </p>
            </div>
          </div>
          
          {!isAnalyzing && (
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-purple-200/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>JPG, PNG, GIF, WebP</span>
              </div>
              <div>Max 10MB</div>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: '🔍', title: 'EXIF Analysis', desc: 'Extract metadata and camera information' },
            { icon: '🛡️', title: 'Tamper Detection', desc: 'Identify manipulated regions using ELA' },
            { icon: '🤖', title: 'AI Detection', desc: 'Analyze if image was AI-generated' },
            { icon: '👥', title: 'Face Analysis', desc: 'Detect and analyze faces in the image' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
              <p className="text-purple-200/70 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ImageUpload;