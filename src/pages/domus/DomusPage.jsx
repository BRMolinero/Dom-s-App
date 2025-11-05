import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPhone, FaKey, FaCapsules, FaWineBottle, FaTimes, FaGlasses, FaWhatsapp /*, FaStop, FaPlay */ } from 'react-icons/fa';
import CustomAlert from '../../components/CustomAlert';
import { useAuth } from '../../context/AuthContext';
// import { pararRobot, reanudarRobot } from '../../api/robot';
// import { message } from 'antd';

const DomusPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchSelected, setSearchSelected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sosPhoneNumber, setSosPhoneNumber] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedObjeto, setSelectedObjeto] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  // const [cargandoParar, setCargandoParar] = useState(false);
  // const [cargandoReanudar, setCargandoReanudar] = useState(false);

  // Eliminar función de configuración global ya que solo se configura desde perfil

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener el teléfono SOS del objeto user
  useEffect(() => {
    if (user?.telefono_sos) {
      setSosPhoneNumber(user.telefono_sos);
    } else {
      setSosPhoneNumber('');
    }
  }, [user]);

  const handleSearchClick = () => {
    if (isMobile) {
      setShowModal(true);
    } else {
      setSearchSelected(!searchSelected);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };


  const handleSOSClick = () => {
    if (!sosPhoneNumber) {
      // Mostrar modal informativo sin opción de navegar automáticamente
      setAlertConfig({
        title: 'Teléfono SOS no configurado',
        message: 'No tienes un número de teléfono SOS configurado. Por favor, ve a tu perfil para configurarlo antes de usar esta función.',
        confirmText: 'Entendido',
        cancelText: null, // Sin botón de cancelar
        type: 'warning',
        onConfirm: () => {
          // Solo cerrar el modal, sin navegar
          setShowAlert(false);
        }
      });
      setShowAlert(true);
      return;
    }

    // Mensaje por defecto para WhatsApp
    const defaultMessage = encodeURIComponent('ALERTA SOS - Necesito ayuda urgente. Por favor contactame inmediatamente.');
    
    // Crear URL de WhatsApp con mensaje por defecto
    // Formato: https://wa.me/[número]?text=[mensaje]
    const whatsappUrl = `https://wa.me/${sosPhoneNumber.replace(/[^\d]/g, '')}?text=${defaultMessage}`;
    
    // 1) Llevar la SPA al inicio para que, al volver desde WhatsApp, quede en Home
    // Usamos replace para no agregar historial extra
    navigate('/', { replace: true });
    
    // 2) Abrir WhatsApp en la misma pestaña
    // Pequeño delay para asegurar que el enrutado se asiente antes de salir de la SPA
    setTimeout(() => {
      window.location.assign(whatsappUrl);
    }, 50);
  };

  const handleObjetoClick = (objeto) => {
    setSelectedObjeto(objeto);
    setShowConfirmModal(true);
  };

  const handleConfirmSearch = () => {
    if (selectedObjeto) {
      console.log('Search Confirmed:', {
        acción: "buscar",
        objeto: selectedObjeto.nombre,
        tipo: selectedObjeto.tipo
      });
      
      setSuccessMessage(`¡Búsqueda iniciada para ${selectedObjeto.nombre}!`);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage('');
      }, 3000);
    }
    
    setShowConfirmModal(false);
    setSelectedObjeto(null);
  };

  const handleCancelSearch = () => {
    setShowConfirmModal(false);
    setSelectedObjeto(null);
  };

  // Manejar parar robot - COMENTADO
  /*
  const handlePararRobot = async () => {
    console.log(' Botón Parar seleccionado');
    setCargandoParar(true);
    setCargandoReanudar(true); // Deshabilitar ambos durante la request
    try {
      const response = await pararRobot();
      console.log('Robot parado exitosamente:', {
        exito: response?.exito,
        mensaje: response?.mensaje,
        estado: response?.estado,
        dispositivo_id: response?.dispositivo_id,
        comando_mqtt: response?.comando_mqtt,
        timestamp: response?.timestamp
      });
      
      // Verificar que la respuesta fue exitosa (el backend devuelve exito: true)
      if (response?.exito !== false) {
        // Usar el mensaje del backend si está disponible (formato: ' Robot apagado correctamente')
        const mensaje = response?.mensaje || response?.message || 'Robot apagado correctamente';
        message.success(mensaje);
      } else {
        // Si exito es false, mostrar mensaje de error
        const errorMsg = response?.mensaje || response?.error || 'Error al apagar el robot';
        message.error(errorMsg);
      }
      
      // TODO: Si hay websocket/estado global del robot, refrescar aquí con response.estado
    } catch (error) {
      console.error(' Error al parar el robot:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al apagar el robot';
      message.error(errorMessage);
    } finally {
      setCargandoParar(false);
      setCargandoReanudar(false);
    }
  };
  */

  // Manejar reanudar robot - COMENTADO
  /*
  const handleReanudarRobot = async () => {
    console.log(' Botón Reanudar seleccionado');
    setCargandoParar(true); // Deshabilitar ambos durante la request
    setCargandoReanudar(true);
    try {
      const response = await reanudarRobot();
      console.log(' Robot reanudado exitosamente:', {
        exito: response?.exito,
        mensaje: response?.mensaje,
        estado: response?.estado,
        dispositivo_id: response?.dispositivo_id,
        comando_mqtt: response?.comando_mqtt,
        timestamp: response?.timestamp
      });
      
      // Verificar que la respuesta fue exitosa (el backend devuelve exito: true)
      if (response?.exito !== false) {
        // Usar el mensaje del backend si está disponible (formato: ' Robot encendido correctamente')
        const mensaje = response?.mensaje || response?.message || 'Robot encendido correctamente';
        message.success(mensaje);
      } else {
        // Si exito es false, mostrar mensaje de error
        const errorMsg = response?.mensaje || response?.error || 'Error al encender el robot';
        message.error(errorMsg);
      }
      
      // TODO: Si hay websocket/estado global del robot, refrescar aquí con response.estado
    } catch (error) {
      console.error(' Error al reanudar el robot:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al encender el robot';
      message.error(errorMessage);
    } finally {
      setCargandoParar(false);
      setCargandoReanudar(false);
    }
  };
  */

  return (
    <div className="domus-page min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Mensaje de Éxito */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] animate-fadeIn">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400 max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#274181] rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-[#0DC0E8] rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-[#F6963F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-[#D95766] rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 sm:pt-28 pb-12">
        {/* Pictogramas Principales */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-12 max-w-4xl mx-auto">
          {/* Pictograma Buscar (oculto) */}
          {/*
          <button 
            onClick={handleSearchClick}
            className={`group relative bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-2xl border-2 border-[#95CDD1] hover:shadow-[#0DC0E8]/20 hover:shadow-3xl transition-all duration-700 w-80 sm:w-80 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8] focus:ring-opacity-70 overflow-hidden ${searchSelected ? 'ring-4 ring-[#0DC0E8] ring-opacity-70 border-[#0DC0E8] shadow-[#0DC0E8]/20' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0DC0E8]/5 to-[#274181]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex flex-col items-center space-y-8">
              <div className={`w-28 h-28 bg-gradient-to-br from-[#274181] to-[#0DC0E8] rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-[#0DC0E8]/40 transition-all duration-700 ${searchSelected ? 'shadow-[#0DC0E8]/40' : ''}`}>
                <FaSearch className="w-16 h-16 text-white transition-transform duration-700 drop-shadow-lg flex items-center justify-center" />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#274181] group-hover:text-[#0DC0E8] transition-colors duration-500">
                  Buscar
                </h3>
                <div className="mt-3 text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-[#0DC0E8] to-[#274181] bg-clip-text text-transparent transition-all duration-500">
                  Localizar objetos
                </div>
              </div>
            </div>
          </button>
          */}

          {/* Pictograma SOS */}
          <button 
            className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-2xl border-2 border-[#D95766] hover:shadow-[#D95766]/20 hover:shadow-3xl transition-all duration-700 w-80 sm:w-80 focus:outline-none focus:ring-4 focus:ring-[#D95766] focus:ring-opacity-70 focus:scale-105 focus:shadow-[#D95766]/40 focus:shadow-3xl active:scale-95 active:shadow-[#D95766]/60 active:shadow-2xl overflow-hidden"
            onClick={handleSOSClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D95766]/5 to-[#F6963F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex flex-col items-center space-y-8">
              <div className="w-28 h-28 bg-gradient-to-r from-[#D95766] to-[#F06A4A] rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-[#D95766]/40 transition-all duration-700 focus:scale-110 focus:rotate-3 active:scale-95">
                <FaWhatsapp className="w-16 h-16 text-white drop-shadow-lg transition-transform duration-700 flex items-center justify-center" />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#D95766] group-hover:bg-gradient-to-r group-hover:from-[#F6963F] group-hover:to-[#D95766] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                  SOS
                </h3>
                <div className="mt-3 text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-[#F6963F] to-[#D95766] bg-clip-text text-transparent transition-all duration-500">
                  Contacto de emergencia
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Botones de control del robot - COMENTADOS */}
        {/* 
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-16 mb-4">
          <button
            onClick={handlePararRobot}
            disabled={cargandoParar || cargandoReanudar}
            className={`group relative bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border-2 border-[#D95766] hover:shadow-[#D95766]/20 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#D95766]/70 overflow-hidden ${
              cargandoParar || cargandoReanudar ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D95766]/5 to-[#F6963F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                cargandoParar || cargandoReanudar ? 'bg-gray-300' : 'bg-gradient-to-r from-[#D95766] to-[#F6963F]'
              }`}>
                <FaStop className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-[#D95766]">
                  {cargandoParar || cargandoReanudar ? 'Procesando...' : 'Parar'}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Detener robot
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleReanudarRobot}
            disabled={cargandoParar || cargandoReanudar}
            className={`group relative bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border-2 border-[#0DC0E8] hover:shadow-[#0DC0E8]/20 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/70 overflow-hidden ${
              cargandoParar || cargandoReanudar ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0DC0E8]/5 to-[#274181]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                cargandoParar || cargandoReanudar ? 'bg-gray-300' : 'bg-gradient-to-r from-[#0DC0E8] to-[#274181]'
              }`}>
                <FaPlay className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-[#0DC0E8]">
                  {cargandoParar || cargandoReanudar ? 'Procesando...' : 'Reanudar'}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Reanudar robot
                </p>
              </div>
            </div>
          </button>
        </div>
        */}

        {/* Pictogramas de búsqueda - Solo en desktop */}
        {searchSelected && !isMobile && (
          <div className="mt-20 animate-fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#274181] mb-4 bg-gradient-to-r from-[#274181] to-[#0DC0E8] bg-clip-text text-transparent">
                ¿Qué estás buscando?
              </h2>
              <p className="text-[#274181]/80 text-xl max-w-2xl mx-auto leading-relaxed">
                Selecciona el tipo de objeto que necesitas encontrar
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {/* Pictograma Llave */}
              <button 
                onClick={() => handleObjetoClick({ id: 'llave-001', nombre: 'Llave', tipo: 'llave' })}
                className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-[#F6963F] hover:shadow-[#F6963F]/20 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#F6963F] focus:ring-opacity-70 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F6963F]/5 to-[#D95766]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#F6963F] to-[#D95766] rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-[#F6963F]/40 transition-all duration-500">
                    <FaKey className="w-14 h-14 text-white transition-transform duration-500 flex items-center justify-center" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#274181] group-hover:text-[#F6963F] transition-colors duration-300">
                      Llave
                    </h3>
                    <p className="text-[#274181]/80 text-lg mt-2">
                      Casa, auto, oficina
                    </p>
                  </div>
                </div>
              </button>

              {/* Pictograma Tapita */}
              <button 
                onClick={() => handleObjetoClick({ id: 'tapita-001', nombre: 'Tapita', tipo: 'tapita' })}
                className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-[#95CDD1] hover:shadow-[#95CDD1]/20 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#95CDD1] focus:ring-opacity-70 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#95CDD1]/5 to-[#0DC0E8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#274181] to-[#95CDD1] rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-[#95CDD1]/40 transition-all duration-500">
                    <img 
                      src="/pictograma_tapita.png" 
                      alt="Tapita" 
                      className="w-24 h-24 object-contain transition-transform duration-500 flex items-center justify-center"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#274181] group-hover:text-[#95CDD1] transition-colors duration-300">
                      Tapita
                    </h3>
                    <p className="text-[#274181]/80 text-lg mt-2">
                      Botellas, frascos
                    </p>
                  </div>
                </div>
              </button>

              {/* Pictograma Pastilla */}
              <button 
                onClick={() => handleObjetoClick({ id: 'pastilla-001', nombre: 'Pastilla', tipo: 'pastilla' })}
                className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-[#0DC0E8] hover:shadow-[#0DC0E8]/20 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8] focus:ring-opacity-70 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0DC0E8]/5 to-[#274181]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0DC0E8] to-[#274181] rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-[#0DC0E8]/40 transition-all duration-500">
                    <FaCapsules className="w-14 h-14 text-white transition-transform duration-500 flex items-center justify-center" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#274181] group-hover:text-[#0DC0E8] transition-colors duration-300">
                      Pastilla
                    </h3>
                    <p className="text-[#274181]/80 text-lg mt-2">
                      Medicamentos
                    </p>
                  </div>
                </div>
              </button>

              {/* Pictograma Anteojos */}
              <button 
                onClick={() => handleObjetoClick({ id: 'anteojos-001', nombre: 'Anteojos', tipo: 'anteojos' })}
                className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border-2 border-[#D95766] hover:shadow-[#D95766]/20 hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#D95766] focus:ring-opacity-70 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#D95766]/5 to-[#F6963F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex flex-col items-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#D95766] to-[#F6963F] rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-[#D95766]/40 transition-all duration-500">
                    <FaGlasses className="w-14 h-14 text-white transition-transform duration-500 flex items-center justify-center" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#274181] group-hover:text-[#D95766] transition-colors duration-300">
                      Anteojos
                    </h3>
                    <p className="text-[#274181]/80 text-lg mt-2">
                      Gafas, lentes
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Modal para móvil */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#274181] bg-gradient-to-r from-[#274181] to-[#0DC0E8] bg-clip-text text-transparent">
                  ¿Qué estás buscando?
                </h2>
                <button
                  onClick={closeModal}
                  className="p-3 rounded-2xl hover:bg-[#95CDD1]/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8]/30"
                >
                  <FaTimes className="w-6 h-6 text-[#274181] hover:text-[#D95766] transition-colors duration-300" />
                </button>
              </div>

              {/* Pictogramas en el modal */}
              <div className="grid grid-cols-2 gap-6">
                {/* Llaves */}
                <button 
                  onClick={() => handleObjetoClick({ id: 'llave-001', nombre: 'Llave', tipo: 'llave' })}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-[#F6963F] hover:shadow-[#F6963F]/20 hover:shadow-xl transition-all duration-400 focus:outline-none focus:ring-4 focus:ring-[#F6963F] focus:ring-opacity-70 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F6963F]/5 to-[#D95766]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                  
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F6963F] to-[#D95766] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#F6963F]/40 transition-all duration-400">
                      <FaKey className="w-8 h-8 text-white transition-transform duration-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#274181] group-hover:text-[#F6963F] transition-colors duration-300">
                        Llave
                      </h3>
                      <p className="text-[#274181]/80 text-sm mt-1">
                        Casa, auto, oficina
                      </p>
                    </div>
                  </div>
                </button>

                {/* Tapitas */}
                <button 
                  onClick={() => handleObjetoClick({ id: 'tapita-001', nombre: 'Tapita', tipo: 'tapita' })}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-[#95CDD1] hover:shadow-[#95CDD1]/20 hover:shadow-xl transition-all duration-400 focus:outline-none focus:ring-4 focus:ring-[#95CDD1] focus:ring-opacity-70 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#95CDD1]/5 to-[#0DC0E8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                  
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#274181] to-[#95CDD1] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#95CDD1]/40 transition-all duration-400">
                      <img 
                        src="/pictograma_tapita.png" 
                        alt="Tapita" 
                        className="w-14 h-14 object-contain transition-transform duration-400"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#274181] group-hover:text-[#95CDD1] transition-colors duration-300">
                        Tapita
                      </h3>
                      <p className="text-[#274181]/80 text-sm mt-1">
                        Botellas, frascos
                      </p>
                    </div>
                  </div>
                </button>

                {/* Pastillas */}
                <button 
                  onClick={() => handleObjetoClick({ id: 'pastilla-001', nombre: 'Pastilla', tipo: 'pastilla' })}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-[#0DC0E8] hover:shadow-[#0DC0E8]/20 hover:shadow-xl transition-all duration-400 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8] focus:ring-opacity-70 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0DC0E8]/5 to-[#274181]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                  
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0DC0E8] to-[#274181] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#0DC0E8]/40 transition-all duration-400">
                      <FaCapsules className="w-8 h-8 text-white transition-transform duration-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#274181] group-hover:text-[#0DC0E8] transition-colors duration-300">
                        Pastilla
                      </h3>
                      <p className="text-[#274181]/80 text-sm mt-1">
                        Medicamentos
                      </p>
                    </div>
                  </div>
                </button>

                {/* Anteojos */}
                <button 
                  onClick={() => handleObjetoClick({ id: 'anteojos-001', nombre: 'Anteojos', tipo: 'anteojos' })}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-[#D95766] hover:shadow-[#D95766]/20 hover:shadow-xl transition-all duration-400 focus:outline-none focus:ring-4 focus:ring-[#D95766] focus:ring-opacity-70 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D95766]/5 to-[#F6963F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                  
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D95766] to-[#F6963F] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#D95766]/40 transition-all duration-400">
                      <FaGlasses className="w-8 h-8 text-white transition-transform duration-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#274181] group-hover:text-[#D95766] transition-colors duration-300">
                        Anteojos
                      </h3>
                      <p className="text-[#274181]/80 text-sm mt-1">
                        Gafas, lentes
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Botón cerrar */}
              <div className="mt-8 text-center">
                <button
                  onClick={closeModal}
                  className="px-10 py-4 bg-gradient-to-r from-[#274181] to-[#0DC0E8] text-white rounded-2xl font-semibold hover:from-[#0DC0E8] hover:to-[#274181] transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8] focus:ring-opacity-50 flex items-center justify-center gap-3 mx-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transform"
                >
                  <FaTimes className="w-5 h-5" />
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación Personalizado */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#274181] mb-2">
                  Confirmar búsqueda
                </h3>
                <p className="text-[#274181]/80 text-lg">
                  ¿Deseas buscar {selectedObjeto?.nombre.toLowerCase()}?
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  onClick={handleCancelSearch}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSearch}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#274181] to-[#0DC0E8] text-white rounded-2xl font-semibold hover:from-[#0DC0E8] hover:to-[#274181] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0DC0E8] focus:ring-opacity-50"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        )}

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

export default DomusPage;