import React, { useEffect, useState, useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';
import type { User, UserRole } from '../types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // This effect would typically check for an existing session
  // You can replace this with your MySQL authentication logic later
  useEffect(() => {
    // Simulate checking if user is logged in
    const checkAuth = async () => {
      setLoading(true);
      
      // Check localStorage for a saved user session
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      // This is a placeholder for your MySQL authentication
      // Replace with actual authentication logic later
      setLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock successful login - replace with actual API call
        // Using password to determine role for demonstration purposes
        let role: UserRole = 'consumer';
        
        // Simple logic to assign different roles based on password for testing
        if (password.includes('creator')) {
          role = 'creator';
        } else if (password.includes('admin')) {
          role = 'admin';
        }
        
        const mockUser: User = {
          id: '123',
          username: email.split('@')[0],
          email,
          role,
          createdAt: new Date().toISOString()
        };
        
        // Save user to state and localStorage
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } catch (error) {
        console.error('Login error:', error);
        throw new Error('Invalid email or password');
      } finally {
        setLoading(false);
      }
    },
    
    signUp: async (email: string, password: string, username: string, role: UserRole) => {
      // This is a placeholder for your MySQL user registration
      // Replace with actual registration logic later
      setLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock successful registration - replace with actual API call
        const mockUser: User = {
          id: Date.now().toString(),
          username,
          email,
          role,
          createdAt: new Date().toISOString()
        };
        
        // Save user to state and localStorage
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } catch (error) {
        console.error('Registration error:', error);
        throw new Error('Could not create account');
      } finally {
        setLoading(false);
      }
    },
    
    signOut: async () => {
      // Clear user from state and localStorage
      setUser(null);
      localStorage.removeItem('user');
    },
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}