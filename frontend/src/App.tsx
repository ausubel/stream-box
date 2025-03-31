import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ManageVideos = React.lazy(() => import('./pages/ManageVideos'));
const Admin = React.lazy(() => import('./pages/Admin'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas - solo accesibles cuando NO estás autenticado */}
          <Route element={<ProtectedRoute requireAuth={false} />}>
            <Route path="login" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Login />
              </React.Suspense>
            } />
            <Route path="signup" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <SignUp />
              </React.Suspense>
            } />
          </Route>

          {/* Rutas protegidas - requieren autenticación */}
          <Route element={<ProtectedRoute requireAuth={true} />}>
            <Route path="/" element={<Layout />}>
              <Route index element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Home />
                </React.Suspense>
              } />
              <Route path="settings" element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Settings />
                </React.Suspense>
              } />
              <Route path="manage" element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ManageVideos />
                </React.Suspense>
              } />
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