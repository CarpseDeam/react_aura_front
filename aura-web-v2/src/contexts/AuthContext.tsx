import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/auth';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, betaKey: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('aura_token');
      if (token) {
        try {
          // Verify token is still valid by making an authenticated request
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('aura_token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('aura_token');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      // --- START DIAGNOSTIC LOGGING ---
      console.log("Token received from API:", response.access_token);
      localStorage.setItem('aura_token', response.access_token);
      console.log("Token retrieved from localStorage:", localStorage.getItem('aura_token'));
      // --- END DIAGNOSTIC LOGGING ---

      // Get user data after successful login
      const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/users/me`, {
        headers: {
          'Authorization': `Bearer ${response.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        throw new Error('Failed to get user data');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, betaKey: string) => {
    try {
      await authApi.register(email, password, betaKey);
      // After registration, automatically log in
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};