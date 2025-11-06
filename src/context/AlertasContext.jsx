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
  const [primeraCarga, setPrimeraCarga] = useState(true); // Bandera para saber si es la primera carga

  // Cargar alertas no leídas
  const cargarAlertasNoLeidas = useCallback(async (mostrarModal = false) => {
    try {
      const data = await obtenerAlertasNoLeidas();
      // Filtrar alertas de tipo "sos_activado" (solo mostrar alertas de sensores fuera de rango)
      const alertas = (data.data || []).filter(alerta => alerta.tipo_alerta !== 'sos_activado');
      
      setAlertasNoLeidas(alertas);
      
      // Si es la primera carga, marcar todas las alertas existentes como "mostradas" para que no se muestren
      if (primeraCarga) {
        const idsAlertasExistentes = new Set(alertas.map(a => a.id));
        setAlertasMostradas(prev => new Set([...prev, ...idsAlertasExistentes]));
        setPrimeraCarga(false);
        // No mostrar modal en la primera carga
        return;
      }
      
      // Filtrar alertas críticas y de severidad alta que no se han mostrado
      // Excluir alertas de tipo "sos_activado" (solo mostrar alertas de sensores fuera de rango)
      const criticas = alertas.filter(
        (alerta) => 
          (alerta.severidad === 'critica' || alerta.severidad === 'alta' || alerta.severidad === 'media') && 
          !alertasMostradas.has(alerta.id) &&
          alerta.tipo_alerta !== 'sos_activado' // No mostrar alertas de mensajes SOS enviados
      );
      
      setAlertasCriticas(criticas);
      
      // Solo mostrar el modal si mostrarModal es true (llamado explícito para mostrar modal)
      if (criticas.length > 0 && mostrarModal) {
        // Buscar la primera alerta que no se ha mostrado
        const nuevaAlerta = criticas.find(a => !alertasMostradas.has(a.id));
        if (nuevaAlerta && (!alertaModalVisible || alertaActual?.id !== nuevaAlerta.id)) {
          setAlertaActual(nuevaAlerta);
          setAlertaModalVisible(true);
          setAlertasMostradas(prev => new Set([...prev, nuevaAlerta.id]));
        }
      }
    } catch (error) {
      console.error('Error al cargar alertas no leídas:', error);
    }
  }, [alertaModalVisible, alertaActual, alertasMostradas, primeraCarga]);

  // Cargar alertas periódicamente solo si está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      // Limpiar estado si no está autenticado
      setAlertasNoLeidas([]);
      setAlertasCriticas([]);
      setAlertaModalVisible(false);
      setAlertaActual(null);
      setPrimeraCarga(true);
      return;
    }
    
    // Primera carga: no mostrar modal automáticamente
    cargarAlertasNoLeidas(false);
    
    // Recargar cada 5 segundos para mantener datos actualizados
    // NO mostrar modal automáticamente en las recargas periódicas
    // Solo se mostrará cuando se cree una nueva alerta (con mostrarModal = true)
    const interval = setInterval(() => cargarAlertasNoLeidas(false), 5000);
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
    setAlertaActual(null);
    // NO mostrar automáticamente la siguiente alerta al cerrar
    // El usuario puede ver las alertas en el panel de alertas si lo desea
  }, []);

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

