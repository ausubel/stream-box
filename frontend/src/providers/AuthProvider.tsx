import React, { useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { User, UserRole } from '../types';
import { authService } from '../services/authService';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificar si hay una sesión existente al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // Verificar si hay un usuario en localStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    
    try {
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, username: string, role: UserRole) => {
    setLoading(true);
    
    try {
      // Convertir el rol a role_id
      let role_id = 2; // Por defecto, consumidor
      if (role === 'creator') role_id = 1;
      if (role === 'admin') role_id = 3;
      
      await authService.register({
        username,
        email,
        password,
        first_name: "", // Estos campos se pueden agregar en el formulario de registro
        last_name: "",  // si se requieren
        role_id
      });
      
      // No iniciamos sesión automáticamente después del registro
      // El usuario debe iniciar sesión explícitamente
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    setLoading(true);
    
    try {
      authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
