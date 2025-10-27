import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import useWebSocket from '../hooks/useWebSocket';

const SensorContext = createContext(null);

export const SensorProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0, co: 0 });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [authOk, setAuthOk] = useState(false);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

  const {
    isConnected: wsConnected,
    error: wsError,
    lastMessage,
    disconnect: disconnectWebSocket,
  } = useWebSocket(wsUrl, {
    maxReconnectAttempts: 10,
    reconnectInterval: 5000,
    // mientras debugueás conexiones dobles podés poner autoReconnect:false
    // autoReconnect: false,
  });

  // Conexión: mostramos “conectado” solo si WS está up y auth_ok recibido
  useEffect(() => {
    setIsConnected(Boolean(wsConnected && authOk));
    setError(wsError);
  }, [wsConnected, authOk, wsError]);

  // Procesar mensajes del WS
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'auth_ok') {
      setAuthOk(true);
      return;
    }
    if (lastMessage.type === 'sensor_data') {
      setSensorData(lastMessage.data);
      setLastUpdate(new Date(lastMessage.timestamp));
      setError(null);
      return;
    }
    if (lastMessage.type === 'error') {
      setError(lastMessage.error || 'Error de WebSocket');
      return;
    }
  }, [lastMessage]);

  const clearSessionData = () => {
    setSensorData({ temperature: 0, humidity: 0, co: 0 });
    setLastUpdate(null);
    setError(null);
    setAuthOk(false);
    disconnectWebSocket?.();
  };

  // IAQ (igual que antes)
  const calculateAirQuality = (temperature, humidity, co) => {
    const tempRef = { min: 18, max: 25, optimal: 21.5 };
    const humidityRef = { min: 30, max: 60, optimal: 45 };
    const coRef = { min: 0, max: 50, optimal: 0 };
    const tempDeviation = Math.abs(temperature - tempRef.optimal) / tempRef.optimal;
    const humidityDeviation = Math.abs(humidity - humidityRef.optimal) / humidityRef.optimal;
    const coDeviation = co / coRef.max;
    const weightedScore = (tempDeviation * 0.3) + (humidityDeviation * 0.3) + (coDeviation * 0.4);
    const iaqScore = Math.max(0, Math.min(100, (1 - weightedScore) * 100));
    let category, description, recommendation;
    if (iaqScore >= 80) { category = 'Excelente'; description = 'Condiciones ambientales óptimas para la salud y el confort.'; recommendation = 'Mantener las condiciones actuales.'; }
    else if (iaqScore >= 60) { category = 'Buena'; description = 'Calidad ambiental aceptable con mínimos riesgos.'; recommendation = 'Monitorear tendencias y ajustar ventilación si es necesario.'; }
    else if (iaqScore >= 40) { category = 'Moderada'; description = 'Puede afectar a personas sensibles.'; recommendation = 'Mejorar ventilación y reducir fuentes de contaminación.'; }
    else if (iaqScore >= 20) { category = 'Insalubre'; description = 'Puede afectar a la población general.'; recommendation = 'Evitar exposiciones prolongadas y usar purificadores.'; }
    else { category = 'Peligrosa'; description = 'Peligro para la salud.'; recommendation = 'Evitar exposición y considerar evacuación si es necesario.'; }
    return { score: Math.round(iaqScore), category, description, recommendation, timestamp: new Date().toISOString() };
  };

  const airQuality = useMemo(
    () => calculateAirQuality(sensorData.temperature, sensorData.humidity, sensorData.co),
    [sensorData]
  );

  const value = useMemo(() => ({
    sensorData,
    lastUpdate,
    isConnected,
    error,
    airQuality,
    clearSessionData,
    getTemperaturePercentage: () => Math.min(Math.max(sensorData.temperature, 0), 50),
    getHumidityPercentage:   () => Math.min(Math.max(sensorData.humidity, 0), 100),
    getCOPercentage:         () => Math.min(Math.max(sensorData.co, 0), 100),
  }), [sensorData, lastUpdate, isConnected, error, airQuality]);

  return (
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensorData = () => {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensorData debe ser usado dentro de SensorProvider');
  return ctx;
};
