import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ManageVideos = React.lazy(() => import('./pages/ManageVideos'));
const Admin = React.lazy(() => import('./pages/Admin'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas - accesibles sin autenticación */}
          <Route element={<ProtectedRoute requireAuth={false} />}>
            <Route path="login" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Login />
              </React.Suspense>
            } />
          </Route>

          {/* Ruta principal - accesible para todos */}
          <Route path="/" element={<Layout />}>
            <Route index element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Home />
              </React.Suspense>
            } />

            {/* Rutas protegidas - requieren autenticación */}
            <Route element={<ProtectedRoute requireAuth={true} />}>
              <Route path="settings" element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Settings />
                </React.Suspense>
              } />
            </Route>
            
            {/* Rutas para creadores */}
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={['creator', 'admin']} />}>
              <Route path="manage" element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ManageVideos />
                </React.Suspense>
              } />
            </Route>
            
            {/* Rutas para administradores */}
            <Route element={<ProtectedRoute requireAuth={true} allowedRoles={['admin']} />}>
              <Route path="admin" element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Admin />
                </React.Suspense>
              } />
            </Route>
          </Route>

          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;