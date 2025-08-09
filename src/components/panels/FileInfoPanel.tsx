import React from 'react';
import { motion } from 'framer-motion';
import { File, Hash, Ruler, Calendar, HardDrive } from 'lucide-react';

interface FileInfoData {
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
}

interface FileInfoPanelProps {
  data: FileInfoData;
}

const FileInfoPanel: React.FC<FileInfoPanelProps> = ({ data }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatHash = (hash: string): string => {
    if (hash.length > 16) {
      return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
    }
    return hash;
  };

  const fileInfoSections = [
    {
      title: 'Basic Information',
      icon: <File className="w-5 h-5" />,
      items: [
        { label: 'Filename', value: data.filename },
        { label: 'File Type', value: data.type },
        { label: 'File Size', value: data.size }
      ]
    },
    {
      title: 'Image Properties',
      icon: <Ruler className="w-5 h-5" />,
      items: [
        { label: 'Dimensions', value: `${data.dimensions.width} × ${data.dimensions.height} pixels` },
        { label: 'Aspect Ratio', value: (data.dimensions.width / data.dimensions.height).toFixed(2) },
        { label: 'Color Space', value: data.colorSpace || 'Unknown' },
        { label: 'Bit Depth', value: data.bitDepth ? `${data.bitDepth} bits` : 'Unknown' }
      ]
    },
    {
      title: 'File Hash',
      icon: <Hash className="w-5 h-5" />,
      items: [
        { label: 'SHA-256', value: formatHash(data.hash), fullValue: data.hash }
      ]
    }
  ];

  if (data.created || data.modified) {
    fileInfoSections.push({
      title: 'Timestamps',
      icon: <Calendar className="w-5 h-5" />,
      items: [
        ...(data.created ? [{ label: 'Created', value: new Date(data.created).toLocaleString() }] : []),
        ...(data.modified ? [{ label: 'Modified', value: new Date(data.modified).toLocaleString() }] : [])
      ]
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <File className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">File Information</h3>
      </div>

      {fileInfoSections.map((section, sectionIndex) => (
        <motion.div
          key={sectionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="text-purple-400">{section.icon}</div>
            <h4 className="font-medium text-white">{section.title}</h4>
          </div>
          
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex justify-between items-center">
                <span className="text-purple-200/70 text-sm">{item.label}:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium max-w-xs truncate">
                    {item.value}
                  </span>
                  {item.fullValue && item.fullValue !== item.value && (
                    <motion.button
                      onClick={() => navigator.clipboard.writeText(item.fullValue)}
                      className="text-purple-400 hover:text-purple-300 text-xs"
                      whileHover={{ scale: 1.05 }}
                      title="Copy full hash"
                    >
                      Copy
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Image Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <h4 className="font-medium text-white">Image Statistics</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-purple-200/70 text-sm">Total Pixels:</span>
              <span className="text-white text-sm">
                {(data.dimensions.width * data.dimensions.height).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200/70 text-sm">Megapixels:</span>
              <span className="text-white text-sm">
                {((data.dimensions.width * data.dimensions.height) / 1000000).toFixed(2)} MP
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-purple-200/70 text-sm">Compression:</span>
              <span className="text-white text-sm">{data.compression || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-200/70 text-sm">Quality:</span>
              <span className="text-white text-sm">
                {data.type === 'image/jpeg' ? 'Lossy' : 'Lossless'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hash Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white/5 rounded-lg p-4"
      >
        <h4 className="font-medium text-white mb-3">File Integrity</h4>
        <div className="bg-black/20 rounded p-3 font-mono text-sm text-purple-200 break-all">
          {data.hash}
        </div>
        <p className="text-xs text-purple-200/70 mt-2">
          This SHA-256 hash can be used to verify file integrity and detect any modifications
        </p>
      </motion.div>
    </div>
  );
};

export default FileInfoPanel;