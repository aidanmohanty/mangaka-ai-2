import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  DownloadIcon, 
  EyeIcon,
  GlobeIcon,
  PaletteIcon,
  CalendarIcon
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface HistoryItem {
  id: string;
  originalImage: string;
  processedImage: string;
  settings: {
    targetLanguage: string;
    enableColoring: boolean;
    coloringStyle: string;
  };
  processedAt: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setHistory([
        {
          id: '1',
          originalImage: '/api/placeholder/300/400',
          processedImage: '/api/placeholder/300/400',
          settings: {
            targetLanguage: 'en',
            enableColoring: true,
            coloringStyle: 'anime'
          },
          processedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          originalImage: '/api/placeholder/300/400',
          processedImage: '/api/placeholder/300/400',
          settings: {
            targetLanguage: 'es',
            enableColoring: false,
            coloringStyle: 'vibrant'
          },
          processedAt: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          originalImage: '/api/placeholder/300/400',
          processedImage: '/api/placeholder/300/400',
          settings: {
            targetLanguage: 'fr',
            enableColoring: true,
            coloringStyle: 'soft'
          },
          processedAt: '2024-01-13T09:15:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ko': 'Korean',
      'zh': 'Chinese'
    };
    return languages[code] || code;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-white/70 mt-4">Loading your processing history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Processing History
          </h1>
          <p className="text-white/70 text-lg">
            View and download your previously processed manga
          </p>
        </div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <ClockIcon size={64} className="mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No History Yet
            </h3>
            <p className="text-white/70 mb-6">
              Start processing some manga to see your history here
            </p>
            <button className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all duration-300">
              Process Your First Manga
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-white/10 rounded-xl overflow-hidden">
                      <img
                        src={item.processedImage}
                        alt="Processed manga"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-white/70">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon size={16} />
                        <span>{formatDate(item.processedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GlobeIcon size={16} />
                        <span>Translated to {getLanguageName(item.settings.targetLanguage)}</span>
                      </div>
                      {item.settings.enableColoring && (
                        <div className="flex items-center space-x-1">
                          <PaletteIcon size={16} />
                          <span>{item.settings.coloringStyle} coloring</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                        {getLanguageName(item.settings.targetLanguage)}
                      </span>
                      {item.settings.enableColoring && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                          AI Colored
                        </span>
                      )}
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300"
                    >
                      <EyeIcon size={16} />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-lg transition-all duration-300">
                      <DownloadIcon size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal for viewing full image */}
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Processed on {formatDate(selectedItem.processedAt)}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Original</h4>
                  <img
                    src={selectedItem.originalImage}
                    alt="Original"
                    className="w-full rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Processed</h4>
                  <img
                    src={selectedItem.processedImage}
                    alt="Processed"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-lg transition-all duration-300">
                  <DownloadIcon size={20} />
                  <span>Download Processed Image</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default History;