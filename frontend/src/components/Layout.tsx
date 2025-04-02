import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Video, Settings, Users, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div 
      className="min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/fondo_total.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay oscuro para mejorar la legibilidad */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 0,
        }}
      />
      
      {/* Contenido con z-index para estar por encima del overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <nav className="bg-transparent shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-white">Stream Box</span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLink to="/" icon={<Home className="h-5 w-5" />} text="Home" />
                  {user?.role === 'creator' && (
                    <NavLink to="/manage" icon={<Video className="h-5 w-5" />} text="Manage Videos" />
                  )}
                  {user?.role === 'admin' && (
                    <NavLink to="/admin" icon={<Users className="h-5 w-5" />} text="Admin" />
                  )}
                  {/* Información de depuración */}
                  {user && (
                    <div className="text-white text-xs bg-gray-800 p-1 rounded absolute top-16 left-0 z-50">
                      <p>Usuario: {user.username}</p>
                      <p>Rol: {user.role}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link to="/settings" className="flex items-center text-white hover:text-indigo-300">
                      <Settings className="h-5 w-5" />
                      <span className="ml-1">Settings</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center text-white hover:text-indigo-300"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="ml-1">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link 
                      to="/login" 
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
        ? 'border-indigo-500 text-white'
        : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
        }`}
    >
      {icon}
      <span className="ml-1">{text}</span>
    </Link>
  );
}