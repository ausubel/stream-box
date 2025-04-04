import { User } from '../types';

const API_URL = 'http://localhost:8000';

// Interfaz para la respuesta de la API
interface ApiResponse {
  data?: any;
  message: string;
  detail?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const rawResult = await response.json();
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!rawResult.data || !rawResult.data.access_token) {
        console.error('Estructura de respuesta inválida:', JSON.stringify(rawResult, null, 2));
        throw new Error('La respuesta no tiene la estructura esperada');
      }
      
      // Obtener información del usuario desde el backend
      const token = rawResult.data.access_token;
      
      // Crear un objeto de usuario con la información disponible
      // Si no hay información de usuario en la respuesta, usamos valores por defecto
      const userData = rawResult.data.user || {};
      
      const user: User = {
        id: userData.id ? userData.id.toString() : '0',
        username: userData.username || email,
        email: userData.email || email,
        role: userData.role_id ? getRoleFromId(userData.role_id) : 'consumer',
        createdAt: new Date().toISOString(),
        token: token
      };


      // Guardar token y usuario en localStorage
      localStorage.setItem('token', token);
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
      const userData = JSON.parse(userStr);
      
      // Asegurarse de que el rol es válido
      if (!userData.role || !['consumer', 'creator', 'admin'].includes(userData.role)) {
        console.error('Rol de usuario no válido:', userData.role);
        // Si el rol no es válido, intentamos obtenerlo del role_id si está disponible
        if (userData.role_id) {
          userData.role = getRoleFromId(userData.role_id);
        } else {
          // Si no hay role_id, asignamos un rol por defecto
          userData.role = 'consumer';
        }
      }
      
      const user: User = {
        id: userData.id || '0',
        username: userData.username || '',
        email: userData.email || '',
        role: userData.role || 'consumer',
        createdAt: userData.createdAt || new Date().toISOString(),
        token: userData.token || '',
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatarUrl: userData.avatarUrl,
        lastLogin: userData.lastLogin
      };
      
      return user;
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
