import React, { useEffect } from 'react';
import { FaTimes, FaExclamationTriangle, FaTimesCircle, FaBell, FaFire } from 'react-icons/fa';
import { useAlertas } from '../context/AlertasContext';
import { useAuth } from '../context/AuthContext';

const ModalAlertaCritica = () => {
  const { isAuthenticated } = useAuth();
  const { alertaActual, alertaModalVisible, marcarComoLeidaYCerrar, cerrarModal } = useAlertas();

  // Si no está autenticado, no mostrar nada
  if (!isAuthenticated) {
    return null;
  }

  // Efecto de sonido y vibración (si el navegador lo soporta)
  useEffect(() => {
    if (alertaModalVisible && alertaActual) {
      // Intentar vibrar (si está disponible)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [alertaModalVisible, alertaActual]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (alertaModalVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [alertaModalVisible]);

  if (!alertaModalVisible || !alertaActual) {
    return null;
  }

  const getSeveridadInfo = (severidad) => {
    switch (severidad) {
      case 'critica':
        return {
          color: 'red',
          bg: 'bg-gradient-to-br from-[#F5F2F2] via-white to-[#F5F2F2]',
          border: 'border-2',
          borderGradient: 'from-[#D95766] via-[#F6963F] to-[#D95766]',
          borderGlow: 'shadow-[0_0_35px_rgba(217,87,102,0.6),0_0_20px_rgba(246,150,63,0.4)]',
          text: 'text-[#274181]',
          titleBg: 'bg-gradient-to-r from-[#D95766] via-[#F6963F] to-[#D95766]',
          icon: <FaFire className="w-full h-full p-2" />,
          iconBg: 'bg-gradient-to-br from-[#D95766] to-[#F6963F]',
          pulse: 'animate-pulse',
          badgeBg: 'bg-gradient-to-r from-[#D95766] via-[#F6963F] to-[#D95766]',
          valueBg: 'bg-gradient-to-r from-white via-[#F5F2F2] to-white',
          valueBorder: 'from-[#D95766] via-[#F6963F] to-[#D95766]',
          valueText: 'bg-gradient-to-r from-[#D95766] to-[#F6963F]',
          glowBg: 'bg-gradient-to-br from-[#D95766]/25 via-[#F6963F]/20 to-[#D95766]/25'
        };
      case 'alta':
        return {
          color: 'orange',
          bg: 'bg-gradient-to-br from-[#F5F2F2] via-white to-[#F5F2F2]',
          border: 'border-2',
          borderGradient: 'from-[#D95766] via-[#F6963F] to-[#D95766]',
          borderGlow: 'shadow-[0_0_30px_rgba(217,87,102,0.5),0_0_15px_rgba(246,150,63,0.35)]',
          text: 'text-[#274181]',
          titleBg: 'bg-gradient-to-r from-[#D95766] via-[#F6963F] to-[#D95766]',
          icon: <FaExclamationTriangle className="w-full h-full p-2" />,
          iconBg: 'bg-gradient-to-br from-[#D95766] to-[#F6963F]',
          pulse: '',
          badgeBg: 'bg-gradient-to-r from-[#D95766] via-[#F6963F] to-[#D95766]',
          valueBg: 'bg-gradient-to-r from-white via-[#F5F2F2] to-white',
          valueBorder: 'from-[#D95766] via-[#F6963F] to-[#D95766]',
          valueText: 'bg-gradient-to-r from-[#D95766] to-[#F6963F]',
          glowBg: 'bg-gradient-to-br from-[#D95766]/20 via-[#F6963F]/15 to-[#D95766]/20'
        };
      default:
        return {
          color: 'yellow',
          bg: 'bg-gradient-to-br from-[#F5F2F2] via-white to-[#F5F2F2]',
          border: 'border-2',
          borderGradient: 'from-[#F6963F] via-[#D95766] to-[#F6963F]',
          borderGlow: 'shadow-[0_0_25px_rgba(246,150,63,0.4),0_0_12px_rgba(217,87,102,0.25)]',
          text: 'text-[#274181]',
          titleBg: 'bg-gradient-to-r from-[#F6963F] via-[#D95766] to-[#F6963F]',
          icon: <FaBell className="w-full h-full p-2" />,
          iconBg: 'bg-gradient-to-br from-[#F6963F] to-[#D95766]',
          pulse: '',
          badgeBg: 'bg-gradient-to-r from-[#F6963F] via-[#D95766] to-[#F6963F]',
          valueBg: 'bg-gradient-to-r from-white via-[#F5F2F2] to-white',
          valueBorder: 'from-[#F6963F] via-[#D95766] to-[#F6963F]',
          valueText: 'bg-gradient-to-r from-[#F6963F] to-[#D95766]',
          glowBg: 'bg-gradient-to-br from-[#F6963F]/18 via-[#D95766]/12 to-[#F6963F]/18'
        };
    }
  };

  const info = getSeveridadInfo(alertaActual.severidad);
  const fecha = new Date(alertaActual.created_at).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-lg overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alerta-critica-title"
      onClick={(e) => {
        // No cerrar al hacer clic en el fondo para alertas críticas
        if (e.target === e.currentTarget && alertaActual.severidad !== 'critica') {
          cerrarModal();
        }
      }}
    >
      {/* Efecto de resplandor de fondo con gradiente */}
      <div 
        className={`absolute inset-0 -z-10 ${info.glowBg} blur-3xl ${info.pulse}`}
        style={{
          animation: info.pulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
        }}
      />
      
      {/* Elementos decorativos adicionales con rojo-naranja */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-32 h-32 bg-[#D95766]/10 rounded-full blur-3xl ${info.pulse}`}></div>
        <div className={`absolute bottom-20 right-20 w-40 h-40 bg-[#F6963F]/10 rounded-full blur-3xl ${info.pulse}`}></div>
        <div className={`absolute top-1/2 left-10 w-24 h-24 bg-[#D95766]/8 rounded-full blur-2xl ${info.pulse}`}></div>
      </div>

      {/* Modal principal con animación y borde con gradiente */}
      <div 
        className={`
          ${info.bg}
          rounded-2xl sm:rounded-3xl 
          shadow-2xl
          w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl
          my-auto
          transform transition-all duration-500 
          scale-100
          ${info.borderGlow}
          ${info.pulse}
          overflow-hidden
          backdrop-blur-sm
          relative
          p-[3px]
        `}
        style={{
          animation: 'fadeIn 0.4s ease-out, zoomIn 0.4s ease-out',
          animationFillMode: 'both',
          background: `linear-gradient(135deg, ${
            info.color === 'red' ? '#D95766, #F6963F, #D95766' :
            info.color === 'orange' ? '#D95766, #F6963F, #D95766' :
            '#F6963F, #D95766, #F6963F'
          })`,
          boxShadow: '0 25px 50px -12px rgba(39, 65, 129, 0.4), 0 0 0 1px rgba(149, 205, 209, 0.1), inset 0 1px 0 rgba(245, 242, 242, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${info.bg.includes('gradient') ? info.bg : 'bg-[#F5F2F2]'} rounded-2xl sm:rounded-3xl h-full w-full`}>
        {/* Header con fondo de color estilo Domus */}
        <div className={`${info.titleBg} text-white relative overflow-hidden`}>
          {/* Patrón de fondo sutil estilo Domus */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 30px 30px, rgba(255,255,255,0.1) 2px, transparent 2px)`,
              backgroundSize: '60px 60px'
            }} />
          </div>
          
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative px-5 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7 flex items-center justify-between gap-4">
            <div className="flex items-center flex-1 min-w-0">
              <h2 
                id="alerta-critica-title" 
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-1.5 sm:mb-2"
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                {alertaActual.severidad === 'critica' || alertaActual.severidad === 'alta' 
                  ? 'ATENCIÓN' 
                  : 'Precaución'}
              </h2>
            </div>
            <button
              onClick={cerrarModal}
              className="p-2.5 sm:p-3.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/40 flex-shrink-0 hover:scale-110 active:scale-95 hover:opacity-80"
              aria-label="Cerrar"
            >
              <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 sm:p-8 md:p-10">
          {/* Descripción principal */}
          <div className="mb-8">
            <p className="text-[#274181] text-xl sm:text-2xl md:text-3xl font-bold mb-6 leading-tight tracking-tight">
              {(() => {
                let desc = alertaActual.descripcion || '';
                // Reemplazos para normalizar texto
                desc = desc.replace(/Nivel alto de CO2 detectado en (Sala|sala)/gi, 'Nivel alto de gas detectado');
                // Eliminar todas las referencias a "Rango óptimo" con diferentes variaciones
                desc = desc.replace(/\.\s*Rango\s+óptimo:.*?%/gi, '');
                desc = desc.replace(/\.\s*Rango\s+óptimo:.*?°/gi, '');
                desc = desc.replace(/\.\s*Rango\s+óptimo:.*?ppm/gi, '');
                desc = desc.replace(/Rango\s+óptimo:.*?%/gi, '');
                desc = desc.replace(/Rango\s+óptimo:.*?°/gi, '');
                desc = desc.replace(/Rango\s+óptimo:.*?ppm/gi, '');
                desc = desc.replace(/\.\s*Rango\s+optimo:.*?%/gi, '');
                desc = desc.replace(/\.\s*Rango\s+optimo:.*?°/gi, '');
                desc = desc.replace(/\.\s*Rango\s+optimo:.*?ppm/gi, '');
                desc = desc.replace(/Rango\s+optimo:.*?%/gi, '');
                desc = desc.replace(/Rango\s+optimo:.*?°/gi, '');
                desc = desc.replace(/Rango\s+optimo:.*?ppm/gi, '');
                // Eliminar referencias a "Valor máximo seguro"
                desc = desc.replace(/Valor\s+máximo\s+seguro:.*?ppm/gi, '');
                desc = desc.replace(/Valor\s+máximo\s+seguro:.*?°/gi, '');
                desc = desc.replace(/Valor\s+máximo\s+seguro:.*?%/gi, '');
                desc = desc.replace(/\.\s*Valor\s+máximo\s+seguro:.*/gi, '');
                // Eliminar referencias a "fuera del rango óptimo"
                desc = desc.replace(/Valor\s+fuera\s+del\s+rango\s+óptimo/gi, '');
                desc = desc.replace(/\.\s*Valor\s+fuera\s+del\s+rango\s+óptimo/gi, '');
                desc = desc.replace(/fuera\s+del\s+rango\s+óptimo/gi, '');
                desc = desc.replace(/fuera\s+del\s+rango\s+optimo/gi, '');
                // Limpiar espacios múltiples y puntos duplicados
                desc = desc.replace(/\s+/g, ' ');
                desc = desc.replace(/\.\s*\./g, '.');
                desc = desc.replace(/\.\s*$/g, '');
                return desc.trim();
              })()}
            </p>
            
            {/* Sensor, Valor, severidad y fecha juntos */}
            <div className="space-y-3">
              {/* Sensor */}
              {(() => {
                const tipoAlerta = alertaActual.tipo_alerta || '';
                let sensor = 'Sensor';
                if (tipoAlerta.includes('temperatura')) {
                  sensor = '🌡️ Temperatura';
                } else if (tipoAlerta.includes('humedad')) {
                  sensor = '💧 Humedad';
                } else if (tipoAlerta.includes('gas')) {
                  sensor = '☁️ Gases Tóxicos';
                }
                return (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#274181] text-base sm:text-lg">Sensor:</span>
                    <span className="font-bold text-[#274181] text-base sm:text-lg">{sensor}</span>
                  </div>
                );
              })()}
              
              {alertaActual.valor_actual && (
                <div 
                  className="relative rounded-xl p-[2px] overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${
                      info.color === 'red' ? '#D95766, #F6963F, #D95766' :
                      info.color === 'orange' ? '#D95766, #F6963F, #D95766' :
                      '#F6963F, #D95766, #F6963F'
                    })`,
                    boxShadow: '0 4px 12px rgba(39, 65, 129, 0.12)'
                  }}
                >
                  <div className={`${info.valueBg} rounded-xl p-5 sm:p-6 flex items-center justify-between`}>
                    <span className="font-semibold text-[#274181] text-base sm:text-lg">Valor:</span>
                    <span 
                      className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${
                          info.color === 'red' ? '#D95766, #F6963F' :
                          info.color === 'orange' ? '#D95766, #F6963F' :
                          '#F6963F, #D95766'
                        })`
                      }}
                    >
                      {alertaActual.valor_actual}
                    </span>
                  </div>
                </div>
              )}
              {/* Severidad */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#274181] text-base sm:text-lg">Severidad:</span>
                <span 
                  className={`px-3 py-1 rounded-lg text-sm sm:text-base font-bold text-white ${info.badgeBg}`}
                >
                  {alertaActual.severidad?.toUpperCase() || 'ALTA'}
                </span>
              </div>
              <p className="text-[#274181]/70 text-sm sm:text-base font-semibold tracking-wide">
                🕒 {fecha}
              </p>
            </div>
          </div>

          {/* Botón de acción estilo Domus con gradiente */}
          <div className="flex justify-center">
            <button
              onClick={() => marcarComoLeidaYCerrar(alertaActual.id)}
              className={`w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-white ${info.badgeBg} hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#95CDD1]/50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-base sm:text-lg relative overflow-hidden group`}
              style={{
                boxShadow: info.color === 'red' ? '0 10px 25px rgba(217, 87, 102, 0.5), 0 5px 12px rgba(246, 150, 63, 0.3)' : 
                           info.color === 'orange' ? '0 10px 25px rgba(217, 87, 102, 0.45), 0 5px 12px rgba(246, 150, 63, 0.3)' : 
                           '0 10px 25px rgba(246, 150, 63, 0.4), 0 5px 12px rgba(217, 87, 102, 0.25)'
              }}
            >
              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10">Marcar como Leída</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAlertaCritica;

