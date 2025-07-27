import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Processor from './pages/Processor';
import Settings from './pages/Settings';
import History from './pages/History';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="bg-hero-pattern min-h-screen">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" replace /> : <Landing />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/process" 
              element={user ? <Processor /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/settings" 
              element={user ? <Settings /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/history" 
              element={user ? <History /> : <Navigate to="/login" replace />} 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;