import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { SaveIcon, UserIcon, GlobeIcon, PaletteIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getErrorMessage } from '../utils/errorUtils';

const Settings: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [preferences, setPreferences] = useState({
    defaultLanguage: user?.preferences?.defaultLanguage || 'en',
    autoColoring: user?.preferences?.autoColoring || false,
    coloringStyle: user?.preferences?.coloringStyle || 'anime',
    textStyle: {
      fontSize: user?.preferences?.textStyle.fontSize || 'medium',
      fontFamily: user?.preferences?.textStyle.fontFamily || 'Arial'
    }
  });

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

  const fontSizes = [
    { value: 'small', name: 'Small' },
    { value: 'medium', name: 'Medium' },
    { value: 'large', name: 'Large' }
  ];

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      await updatePreferences(preferences);
      setMessage('Settings saved successfully!');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to save settings');
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            Settings
          </h1>
          <p className="text-white/70 text-lg">
            Customize your manga processing preferences
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.includes('success') 
              ? 'bg-green-500/20 border border-green-500/30 text-green-200'
              : 'bg-red-500/20 border border-red-500/30 text-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <UserIcon size={24} className="mr-2" />
            Account Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
              />
            </div>
          </div>
        </motion.div>

        {/* Language Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <GlobeIcon size={24} className="mr-2" />
            Language Preferences
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Default Target Language
            </label>
            <p className="text-white/60 text-sm mb-3">
              This language will be pre-selected when processing new images
            </p>
            <select
              value={preferences.defaultLanguage}
              onChange={(e) => setPreferences({
                ...preferences,
                defaultLanguage: e.target.value
              })}
              className="max-w-xs px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-gray-800">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* AI Coloring Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <PaletteIcon size={24} className="mr-2" />
            AI Coloring Preferences
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="autoColoring"
                  checked={preferences.autoColoring}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    autoColoring: e.target.checked
                  })}
                  className="w-5 h-5 text-orange-400 bg-white/10 border-white/20 rounded focus:ring-orange-400 focus:ring-2"
                />
                <label htmlFor="autoColoring" className="text-white font-medium">
                  Enable AI coloring by default
                </label>
              </div>
              <p className="text-white/60 text-sm">
                Automatically apply AI coloring to new manga images
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Default Coloring Style
              </label>
              <p className="text-white/60 text-sm mb-3">
                Choose the AI coloring style to use by default
              </p>
              <select
                value={preferences.coloringStyle}
                onChange={(e) => setPreferences({
                  ...preferences,
                  coloringStyle: e.target.value
                })}
                className="max-w-xs px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                {coloringStyles.map((style) => (
                  <option key={style.value} value={style.value} className="bg-gray-800">
                    {style.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Text Style Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Text Style Preferences
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Font Size
              </label>
              <select
                value={preferences.textStyle.fontSize}
                onChange={(e) => setPreferences({
                  ...preferences,
                  textStyle: {
                    ...preferences.textStyle,
                    fontSize: e.target.value
                  }
                })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                {fontSizes.map((size) => (
                  <option key={size.value} value={size.value} className="bg-gray-800">
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Font Family
              </label>
              <input
                type="text"
                value={preferences.textStyle.fontFamily}
                onChange={(e) => setPreferences({
                  ...preferences,
                  textStyle: {
                    ...preferences.textStyle,
                    fontFamily: e.target.value
                  }
                })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="Arial, Helvetica, etc."
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <SaveIcon size={20} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings;