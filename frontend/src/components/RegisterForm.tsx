import { useState } from 'react';
import { UserCreate } from '../types/user';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000';

const RegisterForm = () => {
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role_id: 1
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (formData.password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Error al registrar usuario');
      }

      toast.success('Usuario registrado correctamente');
      console.log('Registro exitoso:', result);
      
      // Aquí podrías redirigir al usuario a la página de inicio de sesión
      // navigate('/login');
    } catch (error) {
      console.error('Error en el registro:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <div className="p-3 rounded-full bg-purple-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Crea tu cuenta</h2>
      <p className="text-center text-gray-600 mb-6">
        O <a href="/login" className="text-purple-600 hover:underline">inicia sesión</a> con tu cuenta existente
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Nombre"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Apellido"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70"
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
