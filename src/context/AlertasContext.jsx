import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { obtenerAlertasNoLeidas, marcarAlertaComoLeida } from '../api/alertas';
import { useAuth } from './AuthContext';

const AlertasContext = createContext(null);

export function AlertasProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [alertasNoLeidas, setAlertasNoLeidas] = useState([]);
  const [alertasCriticas, setAlertasCriticas] = useState([]);
  const [alertaModalVisible, setAlertaModalVisible] = useState(false);
  const [alertaActual, setAlertaActual] = useState(null);
  const [alertasMostradas, setAlertasMostradas] = useState(new Set()); // IDs de alertas ya mostradas

  // Cargar alertas no leídas
  const cargarAlertasNoLeidas = useCallback(async () => {
    try {
      const data = await obtenerAlertasNoLeidas();
      const alertas = data.data || [];
      
      setAlertasNoLeidas(alertas);
      
      // Filtrar alertas críticas que no se han mostrado
      const criticas = alertas.filter(
        (alerta) => 
          (alerta.severidad === 'critica' || alerta.severidad === 'alta') && 
          !alertasMostradas.has(alerta.id)
      );
      
      setAlertasCriticas(criticas);
      
      // Si hay alertas críticas nuevas y no hay modal visible, mostrar la primera
      if (criticas.length > 0 && !alertaModalVisible && alertaActual === null) {
        setAlertaActual(criticas[0]);
        setAlertaModalVisible(true);
        setAlertasMostradas(prev => new Set([...prev, criticas[0].id]));
      }
    } catch (error) {
      console.error('Error al cargar alertas no leídas:', error);
    }
  }, [alertaModalVisible, alertaActual, alertasMostradas]);

  // Cargar alertas periódicamente solo si está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      // Limpiar estado si no está autenticado
      setAlertasNoLeidas([]);
      setAlertasCriticas([]);
      setAlertaModalVisible(false);
      setAlertaActual(null);
      return;
    }
    
    cargarAlertasNoLeidas();
    
    // Recargar cada 15 segundos para detectar nuevas alertas
    const interval = setInterval(cargarAlertasNoLeidas, 15000);
    return () => clearInterval(interval);
  }, [cargarAlertasNoLeidas, isAuthenticated]);

  // Marcar alerta como leída y cerrar modal
  const marcarComoLeidaYCerrar = useCallback(async (alertaId) => {
    try {
      await marcarAlertaComoLeida(alertaId);
      
      // Remover de alertas críticas
      setAlertasCriticas(prev => prev.filter(a => a.id !== alertaId));
      setAlertasNoLeidas(prev => prev.filter(a => a.id !== alertaId));
      
      // Cerrar modal actual
      setAlertaModalVisible(false);
      setAlertaActual(null);
      
      // Recargar alertas
      await cargarAlertasNoLeidas();
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
    }
  }, [cargarAlertasNoLeidas]);

  // Cerrar modal sin marcar como leída (solo cerrar)
  const cerrarModal = useCallback(() => {
    setAlertaModalVisible(false);
    // Si hay más alertas críticas, mostrar la siguiente
    setAlertaActual(null);
    
    // Si hay más alertas críticas pendientes, esperar un momento y mostrar la siguiente
    setTimeout(() => {
      const siguiente = alertasCriticas.find(a => a.id !== alertaActual?.id && !alertasMostradas.has(a.id));
      if (siguiente) {
        setAlertaActual(siguiente);
        setAlertaModalVisible(true);
        setAlertasMostradas(prev => new Set([...prev, siguiente.id]));
      }
    }, 500);
  }, [alertasCriticas, alertaActual, alertasMostradas]);

  const value = {
    alertasNoLeidas,
    alertasCriticas,
    alertaModalVisible,
    alertaActual,
    marcarComoLeidaYCerrar,
    cerrarModal,
    cargarAlertasNoLeidas
  };

  return (
    <AlertasContext.Provider value={value}>
      {children}
    </AlertasContext.Provider>
  );
}

export const useAlertas = () => {
  const ctx = useContext(AlertasContext);
  if (!ctx) throw new Error('useAlertas debe usarse dentro de AlertasProvider');
  return ctx;
};

