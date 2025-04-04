import { useAuth } from '../hooks/useAuthHook';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// Configuración de axios
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  status: string;
  last_login: string;
}

interface Video {
  id: number;
  title: string;
  creator_username: string;
  status: string;
  created_at: string;
  report_count: number;
  user_id: number;
}

interface Report {
  id: number;
  video_id: number;
  video_title: string;
  reporter_username: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState({
    users: false,
    videos: false,
    reports: false
  });
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    fetchUsers();
    fetchVideos();
    fetchReports();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await api.get('/admin/users');
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(prev => ({ ...prev, videos: true }));
      const response = await api.get('/admin/videos');
      if (response.data && response.data.data) {
        setVideos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Error al cargar videos');
    } finally {
      setLoading(prev => ({ ...prev, videos: false }));
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(prev => ({ ...prev, reports: true }));
      const response = await api.get('/admin/reports');
      if (response.data && response.data.data) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const changeUserRole = async (userId: number, roleId: number) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role_id: roleId });
      toast.success('Rol actualizado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Error al cambiar rol');
    }
  };

  const changeUserStatus = async (userId: number, status: string) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      toast.success('Estado actualizado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const resetPassword = async (userId: number) => {
    const newPassword = prompt('Ingrese la nueva contraseña:');
    if (!newPassword) return;
    
    try {
      await api.put(`/admin/users/${userId}/reset`, { new_password: newPassword });
      toast.success('Contraseña restablecida correctamente');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error al restablecer contraseña');
    }
  };

  const deleteVideo = async (videoId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este video por incumplimiento?')) return;
    
    try {
      await api.delete(`/admin/videos/${videoId}`);
      toast.success('Video eliminado correctamente');
      fetchVideos();
      fetchReports(); // Actualizar reportes ya que pueden cambiar al eliminar un video
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Error al eliminar video');
    }
  };

  const resolveReport = async (reportId: number) => {
    try {
      await api.put(`/admin/reports/${reportId}/resolve`);
      toast.success('Reporte resuelto correctamente');
      fetchReports();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Error al resolver reporte');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Acceso Denegado</h2>
        <p className="mt-2 text-gray-600">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-white-500 text-white-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'videos' ? 'border-white-500 text-white-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Moderación de Videos
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-white-500 text-white-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Reportes de Abuso
          </button>
        </nav>
      </div>

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
          {loading.users ? (
            <div className="text-center py-4">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Acceso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role_id}
                            onChange={(e) => changeUserRole(user.id, parseInt(e.target.value))}
                            className="text-sm text-gray-900 border rounded px-2 py-1"
                          >
                            <option value={1}>Creator</option>
                            <option value={2}>Viewer</option>
                            <option value={3}>Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.status}
                            onChange={(e) => changeUserStatus(user.id, e.target.value)}
                            className="text-sm text-gray-900 border rounded px-2 py-1"
                            disabled={user.role_id === 3}
                          >
                            <option value="activo">Activo</option>
                            <option value="suspendido">Suspendido</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => resetPassword(user.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Restablecer Contraseña
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-4" colSpan={5}>
                        <div className="text-gray-500">No se encontraron usuarios</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Video Moderation */}
      {activeTab === 'videos' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Moderación de Videos</h2>
          {loading.videos ? (
            <div className="text-center py-4">Cargando videos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reportes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <tr key={video.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{video.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{video.creator_username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${video.report_count > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {video.report_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(video.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteVideo(video.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar por Incumplimiento
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-4" colSpan={5}>
                        <div className="text-gray-500">No hay videos para moderar</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Reportes de Abuso</h2>
          {loading.reports ? (
            <div className="text-center py-4">Cargando reportes...</div>
          ) : (
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{report.video_title}</h3>
                        <p className="text-sm text-gray-500">Reportado por: {report.reporter_username}</p>
                        <p className="text-sm text-gray-500">Fecha: {new Date(report.created_at).toLocaleString()}</p>
                        <div className="mt-2">
                          <span className="font-semibold">Motivo:</span> {report.reason}
                        </div>
                        {report.description && (
                          <div className="mt-1">
                            <span className="font-semibold">Descripción:</span> {report.description}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {report.status === 'pendiente' ? 'Pendiente' : 'Resuelto'}
                        </span>
                      </div>
                    </div>
                    {report.status === 'pendiente' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => resolveReport(report.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                        >
                          Marcar como Resuelto
                        </button>
                        <button
                          onClick={() => deleteVideo(report.video_id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                        >
                          Eliminar Video
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No hay reportes de abuso</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}