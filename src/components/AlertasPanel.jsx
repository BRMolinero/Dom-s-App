import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaCircle } from 'react-icons/fa';
import { obtenerAlertas, marcarAlertaComoLeida } from '../api/alertas';
import LoadingMessage from './LoadingMessage';

const AlertasPanel = () => {
  const [alertas, setAlertas] = useState([]);
  const [alertasNoLeidas, setAlertasNoLeidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroSeveridad, setFiltroSeveridad] = useState('alta');
  const [mostrarSoloNoLeidas] = useState(false); // Siempre mostrar todas las alertas

  // Función para cargar alertas
  const cargarAlertas = async () => {
    try {
      setLoading(true);
      
      // Cargar alertas no leídas siempre (excluyendo alertas de tipo "sos_activado")
      const noLeidasData = await obtenerAlertas({ leida: false });
      const noLeidasFiltradas = (noLeidasData.data || []).filter(alerta => alerta.tipo_alerta !== 'sos_activado');
      setAlertasNoLeidas(noLeidasFiltradas);

      // Cargar alertas según filtros
      const filtros = {
        leida: mostrarSoloNoLeidas ? false : undefined,
        severidad: filtroSeveridad !== 'todas' ? filtroSeveridad : undefined
      };
      
      const data = await obtenerAlertas(filtros);
      // Filtrar alertas de tipo "sos_activado" (solo mostrar alertas de sensores fuera de rango)
      const alertasFiltradas = (data.data || []).filter(alerta => alerta.tipo_alerta !== 'sos_activado');
      setAlertas(alertasFiltradas);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      setAlertas([]);
      setAlertasNoLeidas([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar alertas al montar y cuando cambien los filtros
  useEffect(() => {
    cargarAlertas();
    
    // Recargar cada 30 segundos
    const interval = setInterval(() => {
      cargarAlertas();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroSeveridad]);

  // Función para marcar alerta como leída
  const handleMarcarComoLeida = async (alertaId) => {
    try {
      await marcarAlertaComoLeida(alertaId);
      // Recargar alertas después de marcar como leída
      cargarAlertas();
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
      alert('No se pudo marcar la alerta como leída');
    }
  };

  // Obtener colores según severidad
  const getSeveridadColors = (severidad) => {
    switch (severidad) {
      case 'critica':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: 'text-red-500',
          badge: 'bg-red-500'
        };
      case 'alta':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-700',
          icon: 'text-orange-500',
          badge: 'bg-orange-500'
        };
      case 'media':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-500'
        };
      case 'baja':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          icon: 'text-blue-500',
          badge: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: 'text-gray-500',
          badge: 'bg-gray-500'
        };
    }
  };

  // Obtener icono según severidad
  const getSeveridadIcon = (severidad) => {
    switch (severidad) {
      case 'critica':
        return <FaTimesCircle className="w-5 h-5" />;
      case 'alta':
        return <FaExclamationCircle className="w-5 h-5" />;
      case 'media':
        return <FaExclamationCircle className="w-5 h-5" />;
      case 'baja':
        return <FaCircle className="w-4 h-4" />;
      default:
        return <FaBell className="w-5 h-5" />;
    }
  };

  // Capitalizar primera letra
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading && alertas.length === 0) {
    return <LoadingMessage message="Cargando alertas..." />;
  }

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#D95766] rounded-2xl flex items-center justify-center shadow-lg">
            <FaBell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#274181]">Alertas de Sensores</h2>
            {alertasNoLeidas.length > 0 && (
              <p className="text-sm text-[#274181]/70">
                {alertasNoLeidas.length} alerta{alertasNoLeidas.length !== 1 ? 's' : ''} no leída{alertasNoLeidas.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#274181] font-medium">Severidad:</label>
          <select
            value={filtroSeveridad}
            onChange={(e) => setFiltroSeveridad(e.target.value)}
            className="px-3 py-1 rounded-lg border border-[#95CDD1] bg-white text-[#274181] text-sm focus:outline-none focus:ring-2 focus:ring-[#0DC0E8]"
          >
            <option value="todas">Todas</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
          </select>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {alertas.length === 0 ? (
          <div className="text-center py-8">
            <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
            <p className="text-[#274181]/70 font-medium">No hay alertas disponibles</p>
            <p className="text-sm text-[#274181]/50 mt-1">Las alertas aparecerán aquí cuando se detecten anomalías</p>
          </div>
        ) : (
          alertas.map((alerta) => {
            const colors = getSeveridadColors(alerta.severidad);
            const fecha = new Date(alerta.created_at).toLocaleString('es-AR', {
              timeZone: 'America/Argentina/Buenos_Aires',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={alerta.id}
                className={`${colors.bg} ${colors.border} border rounded-xl p-4 transition-all duration-200 ${
                  !alerta.leida ? 'ring-2 ring-opacity-50 ring-[#274181]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`${colors.icon} mt-1`}>
                      {getSeveridadIcon(alerta.severidad)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${colors.badge} text-white`}>
                          {capitalize(alerta.severidad)}
                        </span>
                        {!alerta.leida && (
                          <span className="inline-block w-2 h-2 rounded-full bg-[#274181]"></span>
                        )}
                      </div>
                      <h3 className={`${colors.text} font-semibold mb-1`}>
                        {alerta.descripcion}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-[#274181]/60">
                        <span>Tipo: {alerta.tipo_alerta?.replace(/_/g, ' ')}</span>
                        {alerta.valor_actual && (
                          <span>Valor: {alerta.valor_actual}</span>
                        )}
                        <span>{fecha}</span>
                      </div>
                    </div>
                  </div>
                  {!alerta.leida && (
                    <button
                      onClick={() => handleMarcarComoLeida(alerta.id)}
                      className="flex-shrink-0 p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
                      title="Marcar como leída"
                    >
                      <FaCheckCircle className="w-5 h-5 text-[#274181]/60 hover:text-[#274181]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertasPanel;

