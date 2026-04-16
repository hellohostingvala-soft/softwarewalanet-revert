/**
 * Basic Auth Context - univercel-tech-forge
 * Simple authentication for universal routing
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and set user
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Invalid user data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login - replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        role: 'user',
        first_name: 'Test',
        last_name: 'User'
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
