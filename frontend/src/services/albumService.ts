import { authService } from './authService';
import { Video } from '../types';

const API_URL = 'http://localhost:8000';

export interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  videoCount: number;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface AlbumCreateData {
  title: string;
  description: string;
  cover_image?: string;
}

export interface AlbumUpdateData {
  title?: string;
  description?: string;
  cover_image?: string;
}

export const albumService = {
  // Obtener todos los álbumes del usuario actual
  getUserAlbums: async (): Promise<Album[]> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/my/albums/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener álbumes');
      }

      const result: ApiResponse<any[]> = await response.json();
      
      // Transformar los datos del backend al formato del frontend
      const albums: Album[] = result.data.map(item => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description,
        coverImage: item.cover_image || '',
        userId: item.user_id.toString(),
        createdAt: item.created_at,
        updatedAt: item.created_at,
        videoCount: item.video_count || 0
      }));

      return albums;
    } catch (error) {
      console.error('Error al obtener álbumes del usuario:', error);
      throw error;
    }
  },

  // Crear un nuevo álbum
  createAlbum: async (albumData: AlbumCreateData): Promise<Album> => {
    try {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/my/albums/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(albumData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear álbum');
      }

      const result: ApiResponse<any> = await response.json();
      
      // Transformar la respuesta al formato del frontend
      const album: Album = {
        id: result.data.id.toString(),
        title: result.data.title,
        description: result.data.description,
        coverImage: result.data.cover_image || '',
        userId: result.data.user_id.toString(),
        createdAt: result.data.created_at,
        updatedAt: result.data.created_at,
        videoCount: 0
      };

      return album;
    } catch (error) {
      console.error('Error al crear álbum:', error);
      throw error;
    }
  },

  // Actualizar un álbum existente
  updateAlbum: async (albumId: string, albumData: AlbumUpdateData): Promise<Album> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/my/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(albumData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar álbum');
      }

      const result: ApiResponse<any> = await response.json();
      
      // Transformar la respuesta al formato del frontend
      const album: Album = {
        id: result.data.id.toString(),
        title: result.data.title,
        description: result.data.description,
        coverImage: result.data.cover_image || '',
        userId: result.data.user_id.toString(),
        createdAt: result.data.created_at,
        updatedAt: result.data.created_at,
        videoCount: result.data.video_count || 0
      };

      return album;
    } catch (error) {
      console.error('Error al actualizar álbum:', error);
      throw error;
    }
  },

  // Eliminar un álbum
  deleteAlbum: async (albumId: string): Promise<void> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/my/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar álbum');
      }
    } catch (error) {
      console.error('Error al eliminar álbum:', error);
      throw error;
    }
  },

  // Obtener videos de un álbum
  getAlbumVideos: async (albumId: string): Promise<Video[]> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/my/albums/${albumId}/videos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener videos del álbum');
      }

      const result: ApiResponse<any[]> = await response.json();
      
      // Transformar los datos del backend al formato del frontend
      const videos: Video[] = result.data.map(item => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description,
        youtubeUrl: item.youtube_link,
        thumbnailUrl: item.thumbnail,
        tags: item.tags || [],
        status: item.status === 'en_vivo' ? 'live' : 'recorded',
        userId: item.user_id.toString(),
        createdAt: item.created_at,
        updatedAt: item.created_at
      }));

      return videos;
    } catch (error) {
      console.error('Error al obtener videos del álbum:', error);
      throw error;
    }
  },

  // Agregar un video a un álbum
  addVideoToAlbum: async (albumId: string, videoId: string): Promise<void> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/my/albums/${albumId}/videos/${videoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al agregar video al álbum');
      }
    } catch (error) {
      console.error('Error al agregar video al álbum:', error);
      throw error;
    }
  },

  // Eliminar un video de un álbum
  removeVideoFromAlbum: async (albumId: string, videoId: string): Promise<void> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/my/albums/${albumId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar video del álbum');
      }
    } catch (error) {
      console.error('Error al eliminar video del álbum:', error);
      throw error;
    }
  }
};
