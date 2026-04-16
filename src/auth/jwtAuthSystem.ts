/**
 * Basic JWT Auth Hook - univercel-tech-forge
 * Simple authentication hook for universal routing
 */

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export const useJWTAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    if (token) {
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

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };
};
