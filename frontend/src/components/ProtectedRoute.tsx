import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthHook';

interface ProtectedRouteProps {
  requireAuth?: boolean;
}

/**
 * Componente para proteger rutas basado en el estado de autenticación
 * 
 * @param requireAuth Si es true, la ruta requiere autenticación. Si es false, la ruta solo es accesible para usuarios no autenticados.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAuth = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras se verifica la autenticación, mostramos un indicador de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si requireAuth es true y no hay usuario, redirigir al login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requireAuth es false y hay usuario, redirigir al home (para páginas como login/register)
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // Si pasa las verificaciones, renderizar el componente hijo
  return <Outlet />;
};
