import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ClockIcon, 
  TrendingUpIcon,
  FileImageIcon,
  GlobeIcon,
  PaletteIcon
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Pages Processed',
      value: user?.subscription?.used || 0,
      icon: FileImageIcon,
      color: 'from-blue-400 to-blue-600'
    },
    {
      label: 'Quota Remaining',
      value: (user?.subscription?.processingQuota || 0) - (user?.subscription?.used || 0),
      icon: TrendingUpIcon,
      color: 'from-green-400 to-green-600'
    },
    {
      label: 'Languages',
      value: '6+',
      icon: GlobeIcon,
      color: 'from-purple-400 to-purple-600'
    },
    {
      label: 'AI Styles',
      value: '4',
      icon: PaletteIcon,
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Process New Image',
      description: 'Upload or paste URL to translate manga',
      icon: SparklesIcon,
      link: '/process',
      color: 'from-orange-400 to-pink-400'
    },
    {
      title: 'View History',
      description: 'See your previous translations',
      icon: ClockIcon,
      link: '/history',
      color: 'from-blue-400 to-purple-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-white/70 text-lg">
            Ready to translate some manga today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass rounded-xl p-6"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Link
                  to={action.link}
                  className="block glass rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-white/70">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Subscription Status
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.subscription?.type === 'free' 
                ? 'bg-gray-500/20 text-gray-300'
                : user?.subscription?.type === 'premium'
                ? 'bg-orange-500/20 text-orange-300'
                : 'bg-purple-500/20 text-purple-300'
            }`}>
              {user?.subscription?.type?.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Usage this month</span>
                <span className="text-white">
                  {user?.subscription?.used}/{user?.subscription?.processingQuota}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((user?.subscription?.used || 0) / (user?.subscription?.processingQuota || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>
            
            {user?.subscription?.type === 'free' && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/70 text-sm mb-3">
                  Upgrade to Premium for unlimited processing and AI coloring
                </p>
                <button className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-500 hover:to-pink-500 transition-all duration-300">
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;