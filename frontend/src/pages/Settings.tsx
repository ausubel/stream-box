import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuthHook';
import { profileService } from '../services/profileService';

export default function Settings() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        const profileData = await profileService.getProfile();
        
        // Actualizar estados con los datos del perfil
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
        setUsername(profileData.username || '');
        setEmail(profileData.email || '');

        // Cargar foto de perfil
        try {
          const profilePictureData = await profileService.getProfilePicture();
          if (profilePictureData) {
            setCurrentProfilePicture(profilePictureData);
          }
        } catch (error) {
          console.error('Error al cargar foto de perfil:', error);
          // No mostramos error al usuario para no interrumpir la experiencia
        }
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        toast.error('No se pudieron cargar los datos del perfil');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Actualizar datos básicos del perfil
      await profileService.updateProfile({
        username,
        email,
        first_name: firstName,
        last_name: lastName
      });

      // Si se seleccionó una nueva foto de perfil, actualizarla
      if (profilePicture) {
        await profileService.updateProfilePicture(profilePicture);
        
        // Actualizar la foto de perfil actual con la nueva
        const updatedProfilePicture = await profileService.getProfilePicture();
        setCurrentProfilePicture(updatedProfilePicture);
      }

      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    
    setIsLoading(true);
    try {
      await profileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      // Limpiar campos después de cambiar la contraseña
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Contraseña cambiada correctamente');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(error instanceof Error ? error.message : 'Error al cambiar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);

      // Mostrar vista previa de la imagen seleccionada
      try {
        // Verificar tamaño del archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('La imagen es demasiado grande. El tamaño máximo es 5MB');
          return;
        }

        // Verificar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast.error('El archivo seleccionado no es una imagen');
          return;
        }
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        toast.error('Error al procesar la imagen');
      }
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  if (isLoadingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Cargando datos del perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Configuración de Perfil</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Nombres
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Apellidos
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de Perfil
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {profilePicture ? (
                  <img 
                    src={URL.createObjectURL(profilePicture)} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover" 
                  />
                ) : currentProfilePicture ? (
                  <img 
                    src={currentProfilePicture} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-3xl text-gray-400">{username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSelectFile}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Seleccionar archivo
              </button>
              {profilePicture && (
                <span className="text-sm text-gray-500">{profilePicture.name}</span>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Perfil'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Cambiar Contraseña</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Contraseña Actual
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}