import { User } from '../types';
import { authService } from './authService';

const API_URL = 'http://localhost:8000';

interface ProfileUpdateData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface ProfilePictureData {
  profile_picture: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

interface ApiResponse<T = any> {
  data: T;
  message: string;
}

export const profileService = {
  // Obtener datos del perfil
  getProfile: async (): Promise<any> => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener datos del perfil');
      }

      const result: ApiResponse = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error al obtener datos del perfil:', error);
      throw error;
    }
  },

  // Obtener foto de perfil
  getProfilePicture: async (): Promise<string> => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`${API_URL}/profile/picture`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener foto de perfil');
      }

      const result: ApiResponse<string> = await response.json();
      return result.data || '';
    } catch (error) {
      console.error('Error al obtener foto de perfil:', error);
      return ''; // Devolver cadena vacía en caso de error
    }
  },

  // Actualizar datos del perfil
  updateProfile: async (profileData: ProfileUpdateData): Promise<User> => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar perfil');
      }

      const result: ApiResponse<User> = await response.json();
      
      // Actualizar usuario en localStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          username: result.data.username || currentUser.username,
          email: result.data.email || currentUser.email,
          firstName: result.data.firstName || currentUser.firstName,
          lastName: result.data.lastName || currentUser.lastName
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      return result.data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  // Actualizar foto de perfil
  updateProfilePicture: async (file: File): Promise<User> => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No estás autenticado');

      // Verificar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. El tamaño máximo es 5MB');
      }

      // Verificar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo seleccionado no es una imagen');
      }

      // Convertir archivo a base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (reader.result) {
            // El resultado incluye el tipo de datos al inicio (ej: "data:image/jpeg;base64,")
            resolve(reader.result as string);
          } else {
            reject(new Error('Error al leer el archivo'));
          }
        };
        reader.onerror = error => reject(error);
      });

      const profilePictureData: ProfilePictureData = {
        profile_picture: base64
      };

      const response = await fetch(`${API_URL}/profile/picture`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profilePictureData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar foto de perfil');
      }

      const result: ApiResponse<User> = await response.json();
      
      // Actualizar usuario en localStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          avatarUrl: result.data.avatarUrl || currentUser.avatarUrl
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      return result.data;
    } catch (error) {
      console.error('Error al actualizar foto de perfil:', error);
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData: PasswordChangeData): Promise<void> => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`${API_URL}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cambiar contraseña');
      }

      await response.json();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  },
};
