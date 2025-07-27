import React, { createContext, useContext, useEffect, ReactNode, useRef, useReducer } from 'react';
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

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<User['preferences']> };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, initialized: true };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, loading: false };
    case 'UPDATE_PREFERENCES':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...action.payload
          }
        }
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  loading: true,
  initialized: false
};

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
  const [state, dispatch] = useReducer(authReducer, initialState);
  const mountedRef = useRef(true);
  const initRef = useRef(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          if (mountedRef.current) {
            dispatch({ type: 'SET_USER', payload: null });
          }
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get('/api/auth/me');
        
        if (mountedRef.current) {
          dispatch({ type: 'SET_USER', payload: response.data });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        
        if (mountedRef.current) {
          dispatch({ type: 'SET_USER', payload: null });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (mountedRef.current) {
        dispatch({ type: 'SET_USER', payload: user });
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
      
      if (mountedRef.current) {
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    if (mountedRef.current) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      await axios.put('/api/preferences', { preferences });
      
      if (mountedRef.current) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: state.user,
    login,
    register,
    logout,
    loading: state.loading,
    updatePreferences
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};