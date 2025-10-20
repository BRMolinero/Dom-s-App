import React, { useState, useEffect } from 'react';
// Iconos removidos - ya no se usan en este componente

const PhoneConfig = ({ isOpen, onClose, onSave }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempNumber, setTempNumber] = useState('');

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

  const handleSave = () => {
    if (tempNumber.trim()) {
      setPhoneNumber(tempNumber);
      onSave(tempNumber.trim());
      setIsEditing(false);
      console.log('Número SOS guardado exitosamente:', tempNumber.trim());
    } else {
      console.log('Fallo al guardar número SOS: el número está vacío.');
    }
  };

  const handleCancel = () => {
    setTempNumber(phoneNumber);
    setIsEditing(false);
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
            <p className="text-[#274181]/80 text-sm leading-relaxed">
              Configura el número de teléfono para emergencias. Este número será contactado cuando se presione el botón SOS.
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
                    className="flex-1 bg-gradient-to-r from-[#0DC0E8] to-[#274181] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/30 flex items-center justify-center gap-2"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-[#95CDD1] text-[#274181] py-3 px-4 rounded-xl font-semibold hover:bg-[#95CDD1]/80 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#95CDD1]/30 flex items-center justify-center gap-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full px-4 py-3 rounded-xl border-2 border-[#95CDD1] bg-[#F5F2F2] text-[#274181] font-medium min-h-[52px] flex items-center">
                  {phoneNumber || 'No configurado'}
                </div>
                <button
                  onClick={handleEdit}
                  className="w-full bg-gradient-to-r from-[#F6963F] to-[#D95766] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#F6963F]/30 flex items-center justify-center gap-2"
                >
                  {phoneNumber ? 'Editar Número' : 'Configurar Número'}
                </button>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-[#95CDD1]/10 rounded-xl p-4 border border-[#95CDD1]/20">
            <h3 className="text-sm font-semibold text-[#274181] mb-2">Formato del número:</h3>
            <ul className="text-xs text-[#274181]/70 space-y-1">
              <li>• Incluir código de país (ej: +54 para Argentina)</li>
              <li>• Formato internacional estándar</li>
              <li>• Ejemplo: +5493534567890</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneConfig;

