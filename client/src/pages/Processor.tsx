import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  UploadIcon, 
  LinkIcon, 
  SettingsIcon,
  DownloadIcon,
  SparklesIcon
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Processor: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(user?.preferences.defaultLanguage || 'en');
  const [enableColoring, setEnableColoring] = useState(user?.preferences.autoColoring || false);
  const [coloringStyle, setColoringStyle] = useState(user?.preferences.coloringStyle || 'anime');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  const coloringStyles = [
    { value: 'anime', name: 'Anime Style' },
    { value: 'vibrant', name: 'Vibrant Colors' },
    { value: 'soft', name: 'Soft Pastels' },
    { value: 'realistic', name: 'Realistic' }
  ];

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles[0]) {
      setFile(droppedFiles[0]);
      setUrl('');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl('');
    }
  };

  const processImage = async () => {
    if (!file && !url) return;

    setProcessing(true);
    setResult(null);

    try {
      // This would connect to your backend API
      console.log('Processing with:', { file, url, targetLanguage, enableColoring, coloringStyle });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock result
      setResult({
        processedImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        textAreas: 5,
        message: 'Successfully processed manga page!'
      });
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const canProcess = (user?.subscription.used || 0) < (user?.subscription.processingQuota || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Process Manga
          </h1>
          <p className="text-white/70 text-lg">
            Upload an image or provide a URL to get started
          </p>
        </div>

        {/* Quota Warning */}
        {!canProcess && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            You've reached your processing quota. Please upgrade your plan to continue.
          </div>
        )}

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* File Upload */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <UploadIcon size={24} className="mr-2" />
                Upload File
              </h3>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-orange-400 bg-orange-400/10' 
                    : 'border-white/30 hover:border-white/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <UploadIcon size={48} className="mx-auto mb-4 text-white/50" />
                  <p className="text-white/70 mb-2">
                    Drag & drop your manga image here
                  </p>
                  <p className="text-white/50 text-sm">
                    or click to browse files
                  </p>
                </label>
                {file && (
                  <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-white text-sm">Selected: {file.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* URL Input */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <LinkIcon size={24} className="mr-2" />
                Image URL
              </h3>
              <div className="space-y-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setFile(null);
                  }}
                  placeholder="https://example.com/manga-image.jpg"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <p className="text-white/50 text-sm">
                  Paste a direct link to a manga image
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <SettingsIcon size={24} className="mr-2" />
            Processing Settings
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Target Language */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-gray-800">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Coloring */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                AI Coloring
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="coloring"
                  checked={enableColoring}
                  onChange={(e) => setEnableColoring(e.target.checked)}
                  className="w-5 h-5 text-orange-400 bg-white/10 border-white/20 rounded focus:ring-orange-400 focus:ring-2"
                />
                <label htmlFor="coloring" className="text-white/80">
                  Enable AI coloring
                </label>
              </div>
            </div>

            {/* Coloring Style */}
            {enableColoring && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Coloring Style
                </label>
                <select
                  value={coloringStyle}
                  onChange={(e) => setColoringStyle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  {coloringStyles.map((style) => (
                    <option key={style.value} value={style.value} className="bg-gray-800">
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* Process Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-8"
        >
          <button
            onClick={processImage}
            disabled={processing || (!file && !url) || !canProcess}
            className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {processing ? (
              <>
                <LoadingSpinner size="small" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <SparklesIcon size={20} />
                <span>Process Manga</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              🎉 Processing Complete!
            </h3>
            <p className="text-white/70 mb-4">
              Detected and translated {result.textAreas} text areas
            </p>
            
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <img
                src={result.processedImage}
                alt="Processed manga"
                className="max-w-full h-auto rounded-lg mx-auto"
              />
            </div>

            <button className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-500 hover:to-blue-500 transition-all duration-300 flex items-center space-x-2 mx-auto">
              <DownloadIcon size={20} />
              <span>Download Result</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Processor;