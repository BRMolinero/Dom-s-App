import React, { useState, useEffect } from 'react';
import { 
  configurarTelefonoSOS, 
  obtenerConfiguracionSOS, 
  eliminarTelefonoSOS,
  validarTelefonoInternacional,
  formatearTelefono
} from '../api/sos';
import CustomAlert from './CustomAlert';

const PhoneConfig = ({ isOpen, onClose, onSave }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempNumber, setTempNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    type: 'success',
    onConfirm: () => {}
  });

  // Cargar número guardado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const savedNumber = localStorage.getItem('sosPhoneNumber') || '';
      setPhoneNumber(savedNumber);
      setTempNumber(savedNumber);
    }
  }, [isOpen]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempNumber(phoneNumber);
  };

  const handleSave = async () => {
    if (!tempNumber.trim()) {
      setError('Debe ingresar un número de teléfono');
      return;
    }

    const telefonoFormateado = formatearTelefono(tempNumber.trim());
    
    if (!validarTelefonoInternacional(telefonoFormateado)) {
      setError('Formato inválido. Use formato internacional: +5493512345678');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      setMessageType('success');
      
      const result = await configurarTelefonoSOS(telefonoFormateado);
      
      setPhoneNumber(telefonoFormateado);
      setIsEditing(false);
      
      // Actualizar localStorage para compatibilidad
      localStorage.setItem('sosPhoneNumber', telefonoFormateado);
      
      // Notificar al componente padre
      onSave(telefonoFormateado);
      
      // Limpiar mensaje de eliminación si existía
      if (messageType === 'warning') {
        setMessage(null);
        setMessageType('success');
      }
      
      // Solo mostrar alerta si realmente se configuró un número nuevo
      if (!phoneNumber || phoneNumber !== telefonoFormateado) {
        setAlertConfig({
          title: "¡Configuración exitosa!",
          message: result.mensaje || 'Número SOS configurado correctamente',
          confirmText: "Aceptar",
          cancelText: "",
          type: "success",
          onConfirm: () => {}
        });
        setShowAlert(true);
      }
      
      console.log('Número SOS guardado exitosamente:', telefonoFormateado);
    } catch (err) {
      setError(err.message || 'Error al configurar número SOS');
      console.error('Error al guardar número SOS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempNumber(phoneNumber);
    setIsEditing(false);
    setError(null);
    setMessage(null);
    setMessageType('success');
  };

  const handleEliminar = () => {
    if (!phoneNumber) {
      setError('No hay número configurado para eliminar');
      return;
    }

    setAlertConfig({
      title: "Eliminar número SOS",
      message: "¿Estás seguro de que quieres eliminar el número SOS? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      type: "error",
      onConfirm: eliminarTelefonoConfirmado
    });
    setShowAlert(true);
  };

  const eliminarTelefonoConfirmado = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await eliminarTelefonoSOS();
      
      setPhoneNumber('');
      setTempNumber('');
      
      // Limpiar localStorage
      localStorage.removeItem('sosPhoneNumber');
      
      // Notificar al componente padre
      onSave('');
      
      // Mostrar alerta inmediatamente después de eliminar
      setAlertConfig({
        title: "¡Eliminación exitosa!",
        message: result.mensaje || 'Número SOS eliminado correctamente',
        confirmText: "Aceptar",
        cancelText: "",
        type: "success",
        onConfirm: () => {
          // Después de cerrar la alerta, mostrar mensaje persistente
          setMessage('Teléfono SOS eliminado');
          setMessageType('warning');
        }
      });
      setShowAlert(true);
      
      console.log('Número SOS eliminado exitosamente');
    } catch (err) {
      setError(err.message || 'Error al eliminar número SOS');
      console.error('Error al eliminar número SOS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="config-title">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="config-title" className="text-2xl font-bold text-[#274181] bg-gradient-to-r from-[#274181] to-[#0DC0E8] bg-clip-text text-transparent">
            Configuración SOS
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#95CDD1]/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/30 hover:scale-110"
            aria-label="Cerrar configuración"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {/* Descripción */}
          <div className="text-center">
            <p className="text-[#274181]/80 text-sm leading-relaxed text-justify">
              Configura el número de teléfono para emergencias.<br />
              Este número será contactado cuando se presione el botón SOS.
            </p>
          </div>

          {/* Campo de número */}
          <div className="space-y-3">
            <label htmlFor="phone-input" className="block text-sm font-semibold text-[#274181]">
              Número de Teléfono
            </label>
            
            {isEditing ? (
              <div className="space-y-3">
                <input
                  id="phone-input"
                  type="tel"
                  value={tempNumber}
                  onChange={(e) => setTempNumber(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ej: +5493534567890"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#95CDD1] focus:border-[#0DC0E8] focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/20 transition-all duration-300 text-[#274181] font-medium"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#0DC0E8] to-[#274181] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 bg-[#95CDD1] text-[#274181] py-3 px-4 rounded-xl font-semibold hover:bg-[#95CDD1]/80 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#95CDD1]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full px-4 py-3 rounded-xl border-2 border-[#95CDD1] bg-[#F5F2F2] text-[#274181] font-medium min-h-[52px] flex items-center">
                  {loading ? 'Cargando...' : (phoneNumber || 'No configurado')}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleEdit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#0DC0E8] to-[#274181] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {phoneNumber ? 'Editar' : 'Configurar'}
                  </button>
                  {phoneNumber && (
                    <button
                      onClick={handleEliminar}
                      disabled={loading}
                      className="flex-1 bg-[#D95766] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#D95766]/90 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#D95766]/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}

          {/* Mensajes de estado */}
          {message && (
            <div className={`rounded-xl p-4 border ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-300' 
                : messageType === 'warning' 
                ? 'bg-orange-50 border-orange-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <div className={`font-medium text-sm ${
                messageType === 'success' 
                  ? 'text-green-700' 
                  : messageType === 'warning' 
                  ? 'text-orange-700' 
                  : 'text-red-700'
              }`}>
                {messageType === 'success' && '✅ '}
                {messageType === 'warning' && '⚠️ '}
                {messageType === 'error' && '❌ '}
                {message}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4">
              <div className="text-red-700 font-medium text-sm">❌ Error: {error}</div>
            </div>
          )}
        </div>
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
  );
};

export default PhoneConfig;

