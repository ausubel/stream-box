import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Video, Settings, Users, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <Video className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Stream Box</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink to="/" icon={<Home className="h-5 w-5" />} text="Home" />
                {user?.role === 'creator' && (
                  <NavLink to="/manage" icon={<Video className="h-5 w-5" />} text="Manage Videos" />
                )}
                {user?.role === 'admin' && (
                  <NavLink to="/admin" icon={<Users className="h-5 w-5" />} text="Admin" />
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/settings" className="flex items-center text-gray-700 hover:text-indigo-600">
                    <Settings className="h-5 w-5" />
                    <span className="ml-1">Settings</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="ml-1">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
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
        ? 'border-indigo-500 text-gray-900'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
        }`}
    >
      {icon}
      <span className="ml-1">{text}</span>
    </Link>
  );
}