import { User } from '../types';

const API_URL = 'http://localhost:8000';

interface LoginResponse {
  data: {
    access_token: string;
    token_type: string;
    user?: {
      id: number;
      username: string;
      email: string;
      role_id: number;
    }
  };
  message: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

interface ApiResponse {
  data?: any;
  message: string;
  detail?: string;
}

// Función para convertir role_id a UserRole
const getRoleFromId = (roleId: number): 'consumer' | 'creator' | 'admin' => {
  switch (roleId) {
    case 1:
      return 'creator';
    case 2:
      return 'consumer';
    case 3:
      return 'admin';
    default:
      return 'consumer';
  }
};

// Servicio centralizado para autenticación
export const authService = {
  // Iniciar sesión
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const result: LoginResponse = await response.json();
      console.log('Login response:', result);
      
      // Crear objeto de usuario a partir de la respuesta
      // Como el backend no está devolviendo la información del usuario,
      // creamos un usuario básico con la información que tenemos
      const user: User = {
        id: '1', // ID temporal
        username: email, // Usamos el email como username temporal
        email: email,
        role: 'consumer', // Rol por defecto
        createdAt: new Date().toISOString(),
        token: result.data.access_token
      };

      // Guardar token en localStorage
      localStorage.setItem('token', result.data.access_token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Registrar nuevo usuario
  register: async (registerData: RegisterData): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Error al registrar usuario');
      }

      return result;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Obtener usuario actual desde localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  },

  // Obtener token de autenticación
  getToken(): string | null {
    return localStorage.getItem('token');
  },
};
