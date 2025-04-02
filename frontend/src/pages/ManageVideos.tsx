import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuthHook';
import type { Video } from '../types';
import { videoService } from '../services/videoService';
import { Album, albumService } from '../services/albumService';
import { Share2, Edit, Trash2, Plus, Youtube, Tag, FileVideo } from 'lucide-react';

export default function ManageVideos() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'live' | 'recorded'>('recorded');
  const [videos, setVideos] = useState<Video[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  
  // Album states
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumVideos, setAlbumVideos] = useState<Video[]>([]);
  
  // Modal states
  const [showAddToAlbumModal, setShowAddToAlbumModal] = useState(false);
  const [selectedVideoForAlbum, setSelectedVideoForAlbum] = useState<Video | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVideoForShare, setSelectedVideoForShare] = useState<Video | null>(null);

  // Fetch videos and albums on component mount
  useEffect(() => {
    if (user && user.role === 'creator') {
      fetchVideos();
      fetchAlbums();
    }
  }, [user]);

  // Fetch videos when editing album changes
  useEffect(() => {
    if (selectedAlbum) {
      fetchAlbumVideos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videoService.getUserVideos();
      setVideos(data);
    } catch (error) {
      toast.error('Error al cargar videos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const data = await albumService.getUserAlbums();
      setAlbums(data);
    } catch (error) {
      toast.error('Error al cargar álbumes');
      console.error(error);
    }
  };

  const fetchAlbumVideos = async (albumId: string) => {
    try {
      setLoading(true);
      const data = await albumService.getAlbumVideos(albumId);
      setAlbumVideos(data);
    } catch (error) {
      toast.error('Error al cargar videos del álbum');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetVideoForm = () => {
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setTags([]);
    setStatus('recorded');
    setEditingVideo(null);
  };

  const resetAlbumForm = () => {
    setAlbumTitle('');
    setAlbumDescription('');
    setEditingAlbum(null);
    setShowAlbumForm(false);
  };

  const handleSubmitVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingVideo) {
        // Update existing video
        await videoService.updateVideo(editingVideo.id, {
          title,
          youtube_link: youtubeUrl,
          description,
          status,
          tags
        });
        toast.success('Video actualizado correctamente');
      } else {
        // Create new video
        await videoService.createVideo({
          title,
          youtube_link: youtubeUrl,
          description,
          status,
          tags
        });
        toast.success('Video agregado correctamente');
      }
      
      resetVideoForm();
      fetchVideos();
    } catch (error) {
      toast.error(editingVideo ? 'Error al actualizar video' : 'Error al agregar video');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description);
    setYoutubeUrl(video.youtubeUrl);
    setTags(video.tags);
    setStatus(video.status);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este video?')) {
      try {
        setLoading(true);
        await videoService.deleteVideo(videoId);
        toast.success('Video eliminado correctamente');
        fetchVideos();
      } catch (error) {
        toast.error('Error al eliminar video');
        console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareVideo = (video: Video) => {
    setSelectedVideoForShare(video);
    setShowShareModal(true);
  };

  const handleAddToAlbum = (video: Video) => {
    setSelectedVideoForAlbum(video);
    setShowAddToAlbumModal(true);
  };

  const handleSubmitAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingAlbum) {
        // Update existing album
        await albumService.updateAlbum(editingAlbum.id, {
          title: albumTitle,
          description: albumDescription
        });
        toast.success('Álbum actualizado correctamente');
      } else {
        // Create new album
        await albumService.createAlbum({
          title: albumTitle,
          description: albumDescription
        });
        toast.success('Álbum creado correctamente');
      }
      
      resetAlbumForm();
      fetchAlbums();
    } catch (error) {
      toast.error(editingAlbum ? 'Error al actualizar álbum' : 'Error al crear álbum');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setAlbumTitle(album.title);
    setAlbumDescription(album.description);
    setShowAlbumForm(true);
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este álbum?')) {
      try {
        setLoading(true);
        await albumService.deleteAlbum(albumId);
        toast.success('Álbum eliminado correctamente');
        fetchAlbums();
        if (selectedAlbum && selectedAlbum.id === albumId) {
          setSelectedAlbum(null);
        }
      } catch (error) {
        toast.error('Error al eliminar álbum');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddVideoToAlbum = async (albumId: string, videoId: string) => {
    try {
      await albumService.addVideoToAlbum(albumId, videoId);
      toast.success('Video agregado al álbum');
      setShowAddToAlbumModal(false);
      fetchAlbums();
      if (selectedAlbum) {
        fetchAlbumVideos(selectedAlbum.id);
      }
    } catch (error) {
      toast.error('Error al agregar video al álbum');
      console.error(error);
    }
  };

  const handleRemoveVideoFromAlbum = async (albumId: string, videoId: string) => {
    try {
      await albumService.removeVideoFromAlbum(albumId, videoId);
      toast.success('Video eliminado del álbum');
      fetchAlbums();
      fetchAlbumVideos(albumId);
    } catch (error) {
      toast.error('Error al eliminar video del álbum');
      console.error(error);
    }
  };

  // Redirect if not a creator
  if (user && user.role !== 'creator') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Esta página es solo para creadores de contenido.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <FileVideo className="mr-2" />
          {editingVideo ? 'Editar Video' : 'Agregar Nuevo Video'}
        </h2>
        <form onSubmit={handleSubmitVideo} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
              Enlace de YouTube
            </label>
            <div className="flex">
              <input
                type="url"
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <Youtube className="ml-2 mt-3 text-red-600" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Etiquetas/Categorías
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Agregar etiqueta..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Tag className="h-4 w-4 mr-1" />
                Agregar
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:text-indigo-600 focus:outline-none"
                    >
                      <span className="sr-only">Eliminar</span>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'live' | 'recorded')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="live">En vivo</option>
              <option value="recorded">Grabado</option>
            </select>
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Procesando...' : editingVideo ? 'Actualizar Video' : 'Agregar Video'}
            </button>
            {editingVideo && (
              <button
                type="button"
                onClick={resetVideoForm}
                className="ml-2 w-1/4 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Tus Videos</h2>
        {loading ? (
          <div className="text-center py-4">Cargando videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No se encontraron videos</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl-md">
                    {video.status === 'live' ? 'EN VIVO' : 'GRABADO'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 truncate">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                  
                  {video.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {video.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-2">
                    <div className="space-x-1">
                      <button
                        onClick={() => handleEditVideo(video)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </button>
                    </div>
                    <div className="space-x-1">
                      <button
                        onClick={() => handleAddToAlbum(video)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Álbum
                      </button>
                      <button
                        onClick={() => handleShareVideo(video)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Álbumes Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tus Álbumes</h2>
          <button
            onClick={() => setShowAlbumForm(!showAlbumForm)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            {showAlbumForm ? 'Cancelar' : 'Crear Álbum'}
          </button>
        </div>

        {showAlbumForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4">{editingAlbum ? 'Editar Álbum' : 'Crear Nuevo Álbum'}</h3>
            <form onSubmit={handleSubmitAlbum} className="space-y-4">
              <div>
                <label htmlFor="albumTitle" className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  id="albumTitle"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="albumDescription" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="albumDescription"
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetAlbumForm}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Guardando...' : editingAlbum ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Cargando álbumes...</div>
        ) : albums.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No se encontraron álbumes</div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className={`border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                    selectedAlbum?.id === album.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedAlbum(album)}
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 truncate">{album.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{album.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{album.videoCount} videos</span>
                      <div className="space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAlbum(album);
                          }}
                          className="inline-flex items-center p-1 border border-transparent text-xs font-medium rounded text-indigo-700 hover:bg-indigo-100"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAlbum(album.id);
                          }}
                          className="inline-flex items-center p-1 border border-transparent text-xs font-medium rounded text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedAlbum && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Videos en "{selectedAlbum.title}"</h3>
                  <button
                    onClick={() => setSelectedAlbum(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cerrar
                  </button>
                </div>

                {albumVideos.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">No hay videos en este álbum</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {albumVideos.map((video) => (
                      <div key={video.id} className="flex border rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-24 h-24 object-cover"
                        />
                        <div className="p-3 flex-1">
                          <h4 className="font-medium truncate">{video.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                          <button
                            onClick={() => handleRemoveVideoFromAlbum(selectedAlbum.id, video.id)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para agregar video a álbum */}
      {showAddToAlbumModal && selectedVideoForAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Agregar a Álbum</h3>
            <p className="mb-4">Selecciona un álbum para agregar el video "{selectedVideoForAlbum.title}"</p>
            
            {albums.length === 0 ? (
              <div className="text-gray-500 mb-4">No tienes álbumes. Crea uno primero.</div>
            ) : (
              <div className="max-h-60 overflow-y-auto mb-4">
                {albums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => handleAddVideoToAlbum(album.id, selectedVideoForAlbum.id)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded flex justify-between items-center"
                  >
                    <span>{album.title}</span>
                    <span className="text-xs text-gray-500">{album.videoCount} videos</span>
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddToAlbumModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para compartir video */}
      {showShareModal && selectedVideoForShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Compartir Video</h3>
            <div className="mb-4">
              <p className="mb-2">Enlace del video:</p>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={selectedVideoForShare.youtubeUrl}
                  className="flex-1 p-2 border rounded-l"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedVideoForShare.youtubeUrl);
                    toast.success('Enlace copiado al portapapeles');
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r"
                >
                  Copiar
                </button>
              </div>
            </div>
            <div className="mb-4">
              <p className="mb-2">Compartir en redes sociales:</p>
              <div className="flex space-x-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    selectedVideoForShare.youtubeUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    selectedVideoForShare.youtubeUrl
                  )}&text=${encodeURIComponent(selectedVideoForShare.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-500 text-white px-4 py-2 rounded"
                >
                  Twitter
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${selectedVideoForShare.title} ${selectedVideoForShare.youtubeUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}