import React from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  imageName: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, imageName }) => {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Image Preview</h3>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </motion.button>
          <motion.button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </motion.button>
          <motion.button
            onClick={() => setRotation(rotation + 90)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCw className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-black/20 min-h-[300px] flex items-center justify-center">
        <motion.img
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease'
          }}
          whileHover={{ scale: zoom * 1.05 }}
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-purple-200/70">
          Zoom: {(zoom * 100).toFixed(0)}% | Rotation: {rotation}°
        </p>
      </div>
    </motion.div>
  );
};

export default ImagePreview;