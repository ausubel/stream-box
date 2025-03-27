import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { AuthProvider } from './hooks/useAuth';

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
          <Route path="/" element={<Layout />}>
            <Route index element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Home />
              </React.Suspense>
            } />
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
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;