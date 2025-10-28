import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { HiOutlineTrash } from 'react-icons/hi';
import { 
  configurarTelefonoSOS, 
  obtenerConfiguracionSOS, 
  eliminarTelefonoSOS,
  validarTelefonoInternacional,
  formatearTelefono
} from '../../api/sos';
import { getProfileApi, updateProfileApi } from '../../api/auth';
import CustomAlert from '../../components/CustomAlert';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefono_sos: ''
  });
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // Cargar datos del perfil desde el backend al montar el componente
  useEffect(() => {
    cargarPerfilUsuario();
  }, []);

  // Inicializar datos del formulario cuando se cargan los datos del perfil
  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        telefono_sos: profileData.telefono_sos || ''
      });
    }
  }, [profileData]);

  const cargarPerfilUsuario = async () => {
    try {
      setLoadingProfile(true);
      
      // Cargar datos del perfil desde el backend
      const profileData = await getProfileApi();
      setProfileData(profileData);
      
      // Cargar configuración SOS
      await cargarConfiguracionSOS(profileData);
      
    } catch (err) {
      console.error('Error al cargar perfil del usuario:', err);
      setMessage({ type: 'error', text: 'Error al cargar los datos del perfil' });
      
      // Fallback a datos del contexto si falla el backend
      if (user) {
        setProfileData(user);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const cargarConfiguracionSOS = async (profileDataFromBackend = null) => {
    try {
      const data = await obtenerConfiguracionSOS();
      const numeroBackend = data.telefono_sos || '';
      
      // Actualizar el estado del perfil con el teléfono SOS
      if (profileDataFromBackend) {
        const updatedProfileData = {
          ...profileDataFromBackend,
          telefono_sos: numeroBackend
        };
        setProfileData(updatedProfileData);
        
        // Actualizar también el contexto de autenticación
        const updatedUser = {
          ...user,
          telefono_sos: numeroBackend
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Error al cargar configuración SOS:', err);
      // Si falla, mantener el teléfono vacío en el perfil
      if (profileDataFromBackend) {
        const updatedProfileData = {
          ...profileDataFromBackend,
          telefono_sos: ''
        };
        setProfileData(updatedProfileData);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Verificar si el username cambió y actualizarlo en el backend
      if (formData.username !== profileData?.username) {
        await updateProfileApi({ username: formData.username });
      }

      // Validar y guardar teléfono SOS
      let telefonoFormateado = '';
      if (formData.telefono_sos.trim()) {
        telefonoFormateado = formatearTelefono(formData.telefono_sos.trim());
        
        if (!validarTelefonoInternacional(telefonoFormateado)) {
          setMessage({ type: 'error', text: 'Formato inválido. Use formato internacional: +5493512345678' });
          setLoading(false);
          return;
        }

        // Guardar teléfono SOS en el backend
        await configurarTelefonoSOS(telefonoFormateado);
      } else {
        // Si está vacío, eliminar del backend
        await eliminarTelefonoSOS();
      }
      
      // Actualizar el estado local con el número formateado
      setFormData(prev => ({
        ...prev,
        telefono_sos: telefonoFormateado
      }));
      
      // Actualizar el contexto con los nuevos datos
      const updatedUser = {
        ...user,
        username: formData.username,
        telefono_sos: telefonoFormateado
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales del perfil del backend
    setFormData({
      username: profileData?.username || '',
      email: profileData?.email || '',
      telefono_sos: profileData?.telefono_sos || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleEliminarSOS = () => {
    if (!formData.telefono_sos) {
      setMessage({ type: 'error', text: 'No hay número SOS configurado para eliminar' });
      return;
    }

    setAlertConfig({
      title: 'Eliminar número SOS',
      message: '¿Estás seguro de que quieres eliminar el número SOS? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'error',
      onConfirm: eliminarTelefonoConfirmado
    });
    setShowAlert(true);
  };

  const eliminarTelefonoConfirmado = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await eliminarTelefonoSOS();
      
      setFormData(prev => ({
        ...prev,
        telefono_sos: ''
      }));
      
      // Actualizar el contexto
      const updatedUser = {
        ...user,
        telefono_sos: ''
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Número SOS eliminado correctamente' });
      
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al eliminar número SOS' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile || !profileData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen pt-8 pb-16 px-4 sm:px-4 md:px-8">
      <div className="max-w-md mx-auto px-4 sm:px-2 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 id="profile-title" className="text-2xl font-bold text-[#274181] bg-gradient-to-r from-[#274181] to-[#0DC0E8] bg-clip-text text-transparent">
            Mi Perfil
          </h1>
        </div>

        {/* Descripción */}
        <div className="text-center mb-6">
          <p className="text-[#274181]/80 text-sm leading-relaxed text-justify">
            Gestiona tu información personal y configuración SOS.<br />
          
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`rounded-xl p-4 border mb-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-300' 
              : message.type === 'warning' 
              ? 'bg-orange-50 border-orange-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className={`font-medium text-sm ${
              message.type === 'success' 
                ? 'text-green-700' 
                : message.type === 'warning' 
                ? 'text-orange-700' 
                : 'text-red-700'
            }`}>
              {message.type === 'success' && '✅ '}
              {message.type === 'warning' && '⚠️ '}
              {message.type === 'error' && '❌ '}
              {message.text}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Usuario */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#274181] flex items-center gap-2">
              <UserOutlined className="w-4 h-4" />
              Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                disabled
                className="w-full px-4 py-3 rounded-xl border-2 border-[#95CDD1] bg-[#F5F2F2] text-[#6B7280] font-medium cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email (solo lectura) */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#274181] flex items-center gap-2">
              <MailOutlined className="w-4 h-4" />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border-2 border-[#95CDD1] bg-[#F5F2F2] text-[#6B7280] font-medium cursor-not-allowed"
              />
            </div>
          </div>

          {/* Teléfono SOS */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#274181] flex items-center gap-2">
              <PhoneOutlined className="w-4 h-4" />
              Teléfono SOS
            </label>
            
            <div className="relative">
              <input
                type="tel"
                name="telefono_sos"
                value={!isEditing && !formData.telefono_sos ? 'No configurado' : formData.telefono_sos}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder={isEditing ? "Ej: +5493534567890" : ""}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                  isEditing 
                    ? 'border-[#95CDD1] focus:border-[#0DC0E8] focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/20 bg-white text-[#274181]' 
                    : 'border-[#95CDD1] bg-[#F5F2F2] text-[#6B7280]'
                }`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {formData.telefono_sos && isEditing && (
                <button
                  onClick={handleEliminarSOS}
                  disabled={loading}
                  className="p-1 rounded-lg text-[#274181] hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                  title="Eliminar teléfono SOS"
                >
                  <HiOutlineTrash className="w-3 h-3" />
                </button>
              )}
              <p className="text-xs text-[#6B7280]">
                Número de contacto para emergencias
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-[#0DC0E8] to-[#274181] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/30 flex items-center justify-center gap-2"
              >
                <EditOutlined className="w-4 h-4" />
                Editar Perfil
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-[#95CDD1] text-[#274181] py-3 px-4 rounded-xl font-semibold hover:bg-[#95CDD1]/80 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#95CDD1]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#0DC0E8] to-[#274181] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="text-[#274181] text-sm font-semibold mb-2">
            ℹ️ Información importante
          </h3>
          <ul className="text-[#1E40AF] text-xs space-y-1 list-disc list-inside">
            <li>El usuario y email no se pueden modificar por razones de seguridad.</li>
            <li>El teléfono SOS se utilizará para contactarse en caso de emergencia.</li>
          </ul>
        </div>

        {/* Custom Alert */}
        <CustomAlert
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          onConfirm={alertConfig.onConfirm}
          title={alertConfig.title}
          message={alertConfig.message}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          type={alertConfig.type}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
