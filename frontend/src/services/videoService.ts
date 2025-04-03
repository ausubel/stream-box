import { Video } from '../types';
import { authService } from './authService';

const API_URL = 'http://localhost:8000';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface VideoCreateData {
  user_id: number;
  title: string;
  youtube_link: string;
  description: string;
  type?: string;
  status: 'live' | 'recorded';
  thumbnail: string;
  tags: string[];
}

export interface VideoUpdateData {
  title?: string;
  youtube_link?: string;
  description?: string;
  type?: string;
  status?: 'live' | 'recorded';
  thumbnail?: string;
  tags?: string[];
}

// Función para extraer el ID de YouTube de una URL
export const extractYoutubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

// Función para obtener la URL de la miniatura de YouTube
export const getYoutubeThumbnail = (youtubeId: string): string => {
  // Usamos la miniatura por defecto (0.jpg) en lugar de maxresdefault.jpg
  // ya que maxresdefault.jpg no siempre está disponible
  return `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
};

export const videoService = {
  // Obtener todos los videos del usuario actual
  getUserVideos: async (): Promise<Video[]> => {
    try {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/videos/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener videos');
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
        updatedAt: item.created_at // El backend no tiene updated_at, usamos created_at
      }));

      return videos;
    } catch (error) {
      console.error('Error al obtener videos del usuario:', error);
      throw error;
    }
  },

  // Crear un nuevo video
  createVideo: async (videoData: Omit<VideoCreateData, 'user_id' | 'thumbnail'>): Promise<Video> => {
    try {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Extraer ID de YouTube y obtener miniatura
      const youtubeId = extractYoutubeId(videoData.youtube_link);
      const thumbnail = getYoutubeThumbnail(youtubeId);

      const payload = {
        ...videoData,
        user_id: parseInt(user.id),
        thumbnail,
        type: videoData.type || (videoData.status === 'live' ? 'en_vivo' : 'grabado')
      };

      const response = await fetch(`${API_URL}/videos/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear video');
      }

      const result: ApiResponse<any> = await response.json();
      
      // Transformar la respuesta al formato del frontend
      const video: Video = {
        id: result.data.id.toString(),
        title: result.data.title,
        description: result.data.description,
        youtubeUrl: result.data.youtube_link,
        thumbnailUrl: result.data.thumbnail,
        tags: result.data.tags || [],
        status: result.data.status === 'en_vivo' ? 'live' : 'recorded',
        userId: result.data.user_id.toString(),
        createdAt: result.data.created_at,
        updatedAt: result.data.created_at
      };

      return video;
    } catch (error) {
      console.error('Error al crear video:', error);
      throw error;
    }
  },

  // Actualizar un video existente
  updateVideo: async (videoId: string, videoData: VideoUpdateData): Promise<Video> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      // Si se actualiza el enlace de YouTube, actualizar también la miniatura
      let payload = { ...videoData };
      
      if (videoData.youtube_link) {
        const youtubeId = extractYoutubeId(videoData.youtube_link);
        payload.thumbnail = getYoutubeThumbnail(youtubeId);
      }
      
      // Convertir status a type si es necesario
      if (videoData.status) {
        payload.type = videoData.status === 'live' ? 'en_vivo' : 'grabado';
      }

      const response = await fetch(`${API_URL}/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar video');
      }

      const result: ApiResponse<any> = await response.json();
      
      // Transformar la respuesta al formato del frontend
      const video: Video = {
        id: result.data.id.toString(),
        title: result.data.title,
        description: result.data.description,
        youtubeUrl: result.data.youtube_link,
        thumbnailUrl: result.data.thumbnail,
        tags: result.data.tags || [],
        status: result.data.status === 'en_vivo' ? 'live' : 'recorded',
        userId: result.data.user_id.toString(),
        createdAt: result.data.created_at,
        updatedAt: result.data.created_at
      };

      return video;
    } catch (error) {
      console.error('Error al actualizar video:', error);
      throw error;
    }
  },

  // Eliminar un video
  deleteVideo: async (videoId: string): Promise<void> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar video');
      }
    } catch (error) {
      console.error('Error al eliminar video:', error);
      throw error;
    }
  },

  // Obtener todas las etiquetas disponibles
  getTags: async (): Promise<string[]> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/videos/tags`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener etiquetas');
      }

      const result: ApiResponse<any[]> = await response.json();
      
      // Procesar las etiquetas que pueden venir como objetos o strings
      const tags: string[] = result.data.map((tag: any) => {
        if (typeof tag === 'object' && tag !== null) {
          // Si es un objeto con propiedad 'name', usar esa propiedad
          if ('name' in tag) {
            return tag.name;
          }
          // Si es un objeto con propiedad 'tag_name', usar esa propiedad
          if ('tag_name' in tag) {
            return tag.tag_name;
          }
        }
        // Si es un string o no tiene las propiedades esperadas, devolver el valor tal cual
        return tag;
      });

      return tags;
    } catch (error) {
      console.error('Error al obtener etiquetas:', error);
      throw error;
    }
  }
};
