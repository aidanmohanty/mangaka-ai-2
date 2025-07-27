import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  preferences: {
    defaultLanguage: string;
    autoColoring: boolean;
    coloringStyle: string;
    textStyle: {
      fontSize: string;
      fontFamily: string;
    };
  };
  subscription: {
    type: string;
    processingQuota: number;
    used: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        if (isMountedRef.current) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        if (isMountedRef.current) {
          setUser(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (isMountedRef.current) {
        setUser(user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', { username, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (isMountedRef.current) {
        setUser(user);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    if (isMountedRef.current) {
      setUser(null);
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      await axios.put('/api/preferences', { preferences });
      if (user && isMountedRef.current) {
        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences
          }
        });
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updatePreferences
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};