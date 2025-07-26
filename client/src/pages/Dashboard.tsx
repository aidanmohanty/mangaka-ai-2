  import React from 'react';
  import { User, Upload, History, Settings, LogOut, Zap, Star, Globe } from 'lucide-react';
  import { useAuth } from '../contexts/AuthContext';

  const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();

    const stats = [
      { label: 'Images Translated', value: '0', icon: Globe },
      { label: 'Pages Processed', value: '0', icon: Zap },
      { label: 'Credits Remaining', value: '100', icon: Star },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Navigation */}
        <nav className="backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-white">Mangaka.AI</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white/80">Welcome, {user?.username}</span>
                <button
                  onClick={logout}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-white/70">Transform your manga with AI-powered translation</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Upload Section */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20">
              <div className="text-center">
                <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload Manga</h3>
                <p className="text-white/70 mb-6">Upload your manga images for AI translation</p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium">
                  Choose Files
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20">
              <div className="flex items-center mb-4">
                <History className="h-6 w-6 text-purple-400 mr-2" />
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                <div className="text-center py-8">
                  <p className="text-white/50">No recent activity</p>
                  <p className="text-white/40 text-sm">Upload your first manga to get started!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="backdrop-blur-md bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/20 transition-all duration-200 group">
              <Upload className="h-6 w-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white text-sm font-medium">New Translation</p>
            </button>

            <button className="backdrop-blur-md bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/20 transition-all duration-200 group">
              <History className="h-6 w-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white text-sm font-medium">View History</p>
            </button>

            <button className="backdrop-blur-md bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/20 transition-all duration-200 group">
              <Settings className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white text-sm font-medium">Settings</p>
            </button>

            <button className="backdrop-blur-md bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/20 transition-all duration-200 group">
              <Star className="h-6 w-6 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white text-sm font-medium">Upgrade Plan</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default Dashboard;