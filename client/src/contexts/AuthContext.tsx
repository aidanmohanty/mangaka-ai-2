import React, { createContext, useContext, useEffect, ReactNode, useRef, useReducer } from 'react';
import axios from 'axios';

// Validate user object structure
const validateUser = (user: any): boolean => {
  if (!user) {
    console.error('User validation failed: user is null/undefined');
    return false;
  }
  
  // Handle both _id and id formats for compatibility
  const userId = user.id || user._id;
  if (!userId || (typeof userId !== 'string' && typeof userId !== 'object')) {
    console.error('User validation failed: id is invalid', typeof userId, userId);
    return false;
  }
  
  // Convert ObjectId to string if needed
  if (typeof userId === 'object' && userId.toString) {
    user.id = userId.toString();
  } else if (typeof userId === 'string') {
    user.id = userId;
  }
  
  if (typeof user.username !== 'string') {
    console.error('User validation failed: username is not string', typeof user.username);
    return false;
  }
  
  if (typeof user.email !== 'string') {
    console.error('User validation failed: email is not string', typeof user.email);
    return false;
  }
  
  if (!user.preferences) {
    console.error('User validation failed: preferences missing', user.preferences);
    return false;
  }
  
  if (!user.subscription) {
    console.error('User validation failed: subscription missing', user.subscription);
    return false;
  }
  
  return true;
};

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
        
        if (mountedRef.current && validateUser(response.data)) {
          dispatch({ type: 'SET_USER', payload: response.data });
        } else if (mountedRef.current) {
          // Invalid user data, clear auth
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({ type: 'SET_USER', payload: null });
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
      console.log('Attempting login for:', email);
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login response received:', response.data);
      
      const { token, user } = response.data;
      
      if (!token) {
        console.error('Login failed: No token in response');
        throw new Error('No authentication token received');
      }
      
      if (!user) {
        console.error('Login failed: No user data in response');
        throw new Error('No user data received');
      }

      console.log('Validating user data:', user);
      if (!validateUser(user)) {
        console.error('Login failed: User validation failed');
        throw new Error('Invalid user data structure');
      }
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (mountedRef.current) {
        dispatch({ type: 'SET_USER', payload: user });
      }
      
      console.log('Login successful');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // If it's an axios error, get the response error message
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Attempting registration for:', username, email);
      const response = await axios.post('/api/auth/register', { username, email, password });
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token) {
        console.error('Registration failed: No token in response');
        throw new Error('No authentication token received');
      }
      
      if (!user) {
        console.error('Registration failed: No user data in response');
        throw new Error('No user data received');
      }
      
      console.log('Validating user data:', user);
      if (!validateUser(user)) {
        console.error('Registration failed: User validation failed');
        throw new Error('Invalid user data structure');
      }
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (mountedRef.current) {
        dispatch({ type: 'SET_USER', payload: user });
      }
      
      console.log('Registration successful');
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