import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Calendar, MapPin, Settings, Info } from 'lucide-react';

interface MetadataInfo {
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
  message?: string;
  suggestion?: string;
  [key: string]: any;
}

interface MetadataPanelProps {
  data: MetadataInfo;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({ data }) => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const metadataGroups = [
    {
      title: 'Camera Information',
      icon: <Camera className="w-5 h-5" />,
      items: [
        { label: 'Camera', value: data.camera },
        { label: 'Lens', value: data.lens },
        { label: 'Software', value: data.software }
      ]
    },
    {
      title: 'Camera Settings',
      icon: <Settings className="w-5 h-5" />,
      items: [
        { label: 'ISO', value: data.settings?.iso },
        { label: 'Aperture', value: data.settings?.aperture ? `f/${data.settings.aperture}` : undefined },
        { label: 'Shutter Speed', value: data.settings?.shutterSpeed },
        { label: 'Focal Length', value: data.settings?.focalLength ? `${data.settings.focalLength}mm` : undefined }
      ]
    },
    {
      title: 'Timestamp',
      icon: <Calendar className="w-5 h-5" />,
      items: [
        { label: 'Date Taken', value: data.timestamp ? new Date(data.timestamp).toLocaleString() : undefined }
      ]
    }
  ];

  if (data.gps?.latitude && data.gps?.longitude) {
    metadataGroups.push({
      title: 'Location',
      icon: <MapPin className="w-5 h-5" />,
      items: [
        { label: 'Latitude', value: data.gps.latitude.toFixed(6) },
        { label: 'Longitude', value: data.gps.longitude.toFixed(6) }
      ]
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">EXIF Metadata</h3>
      </div>

      {metadataGroups.map((group, groupIndex) => (
        <motion.div
          key={groupIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="text-purple-400">{group.icon}</div>
            <h4 className="font-medium text-white">{group.title}</h4>
          </div>
          
          <div className="space-y-2">
            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex justify-between items-center">
                <span className="text-purple-200/70 text-sm">{item.label}:</span>
                <span className="text-white text-sm font-medium">
                  {formatValue(item.value)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {data.gps?.latitude && data.gps?.longitude && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">GPS Location</h4>
            <motion.button
              onClick={() => {
                const url = `https://www.google.com/maps?q=${data.gps!.latitude},${data.gps!.longitude}`;
                window.open(url, '_blank');
              }}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              View on Map
            </motion.button>
          </div>
          <div className="text-sm text-purple-200/70">
            Click "View on Map" to see the location where this photo was taken
          </div>
        </motion.div>
      )}

      {(Object.keys(data).length === 0 || (Object.keys(data).length <= 2 && data.message)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
        >
          <Info className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-yellow-200 font-medium mb-2">No EXIF metadata found in this image</p>
          {data.message && (
            <p className="text-yellow-200/80 text-sm mb-3 max-w-md mx-auto">
              {data.message}
            </p>
          )}
          {data.suggestion && (
            <div className="bg-yellow-500/10 rounded-lg p-3 mt-4 max-w-md mx-auto">
              <p className="text-yellow-200 text-sm font-medium mb-1">💡 Tip:</p>
              <p className="text-yellow-200/90 text-sm">
                {data.suggestion}
              </p>
            </div>
          )}
          {!data.message && (
            <p className="text-yellow-200/70 text-sm mt-2">
              This could indicate the metadata was stripped or the image format doesn't support EXIF data
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MetadataPanel;