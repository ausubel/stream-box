import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuthHook';
import { Mail, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000';

  // Función para manejar el cambio entre formularios con animación
  const toggleForm = (showReg: boolean) => {
    setAnimating(true);
    setTimeout(() => {
      setShowRegister(showReg);
      setTimeout(() => {
        setAnimating(false);
      }, 300);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(username, password);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión. Por favor verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (registerPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
          first_name: firstName,
          last_name: lastName,
          role_id: 2 // Por defecto, rol de consumidor
        })
      });
      
      const data = await response.json();
      
      if (data.message === 'SUCCESS') {
        toast.success('Cuenta creada exitosamente');
        toggleForm(false); // Volver al formulario de login con animación
        // Limpiar campos del formulario de registro
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
      } else {
        toast.error(`Error al registrarse: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      toast.error('Error al registrarse. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-3xl shadow-md overflow-hidden w-full max-w-3xl flex h-[550px]">
        {/* Contenedor de formularios con animación */}
        <div className="w-full md:w-1/2 p-6 relative flex items-center justify-center">
          {/* Formulario de Login */}
          <div 
            className={`w-full transition-all duration-500 ease-in-out ${
              !showRegister 
                ? 'opacity-100 transform translate-x-0 z-10' 
                : 'opacity-0 transform -translate-x-full z-0 absolute'
            } ${
              animating ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
            
            <p className="text-center text-xs text-gray-600 mb-6">o usa tu nombre de usuario y contraseña</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  className="w-full py-3 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full py-3 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              {/* <div className="text-right">
                <a href="#" className="text-xs text-indigo-600 hover:underline">¿Olvidaste tu contraseña?</a>
              </div> */}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-70 transition-colors text-sm"
              >
                {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
              </button>
            </form>
          </div>

          {/* Formulario de Registro */}
          <div 
            className={`w-full transition-all duration-500 ease-in-out ${
              showRegister 
                ? 'opacity-100 transform translate-x-0 z-10' 
                : 'opacity-0 transform translate-x-full z-0 absolute'
            } ${
              animating ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            <h2 className="text-2xl font-bold text-center mb-4">Crear Cuenta</h2>
            
            <p className="text-center text-xs text-gray-600 mb-4">o regístrate con tu email</p>
            
            <form onSubmit={handleRegister} className="space-y-2.5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  className="w-full py-2 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full py-2 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Apellido"
                  className="w-full py-2 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="w-full py-2 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full py-2 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  className="w-full py-2 pl-9 pr-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-70 transition-colors text-sm mt-2"
              >
                {loading ? 'Registrando...' : 'CREAR CUENTA'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Panel lateral (derecha) */}
        <div className="hidden md:block md:w-1/2 bg-indigo-600 p-6 text-white flex flex-col justify-center items-center text-center">
          <div className={`transition-all duration-500 ease-in-out transform ${!showRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-2xl font-bold mb-4">¡Hola, amigo!</h1>
            <p className="mb-8 text-sm">Regístrate con tus datos personales para usar todas las funciones del sitio</p>
            <button 
              onClick={() => toggleForm(true)}
              className="py-2 px-8 border-2 border-white rounded-full font-medium hover:bg-white hover:text-indigo-600 transition-colors text-sm"
              disabled={animating}
            >
              REGISTRARSE
            </button>
          </div>
          
          <div className={`transition-all duration-500 ease-in-out transform ${showRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-2xl font-bold mb-4">¡Bienvenido de nuevo!</h1>
            <p className="mb-8 text-sm">Ingresa tus datos personales para usar todas las funciones del sitio</p>
            <button 
              onClick={() => toggleForm(false)}
              className="py-2 px-8 border-2 border-white rounded-full font-medium hover:bg-white hover:text-indigo-600 transition-colors text-sm"
              disabled={animating}
            >
              INICIAR SESIÓN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}