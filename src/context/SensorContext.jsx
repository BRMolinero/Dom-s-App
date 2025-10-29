import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useWebSocket from "../hooks/useWebSocket";

const SensorContext = createContext(null);

export const SensorProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    co: 0,
    pm25: 0,
    co2: 0,
  });
  const [airQuality, setAirQuality] = useState({
    score: 0,
    category: 'desconocida',
    description: 'Sin datos disponibles',
    recommendation: 'Esperando datos de sensores...'
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [authOk, setAuthOk] = useState(false);

  // NUEVO: control de token
  const [authPending, setAuthPending] = useState(true);
  const [didConnectOnce, setDidConnectOnce] = useState(false);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

  const {
    isConnected: wsConnected,
    error: wsError,
    lastMessage,
    connect,
    disconnect,
    connecting,
    sendMessage,
  } = useWebSocket(wsUrl, {
    maxReconnectAttempts: 10,
    reconnectInterval: 5000,
    autoReconnect: true,
    deferConnect: true, // 👈 clave: no conectar hasta tener token o dejemos de esperar
  });

  // 1) Esperar token (localStorage) o dar timeout de cortesía y conectar igual
  useEffect(() => {
    const hasToken = !!(
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token')
    );
    if (hasToken) {
      setAuthPending(false);
      return;
    }
    // polling breve
    setAuthPending(true);
    let tries = 0;
    const iv = setInterval(() => {
      const ok = !!(
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('auth_token')
      );
      if (ok) {
        setAuthPending(false);
        clearInterval(iv);
      } else if (++tries > 50) { // ~10s
        setAuthPending(false);
        clearInterval(iv);
      }
    }, 200);
    return () => clearInterval(iv);
  }, []);

  // 2) Disparar la conexión UNA sola vez después de authPending=false
  useEffect(() => {
    if (!didConnectOnce && authPending === false) {
      console.log('🔌 Conectando WebSocket...');
      connect();
      setDidConnectOnce(true);
    }
  }, [authPending, didConnectOnce, connect]);

  // 2.5) Re-autenticar si el token se actualiza después de la conexión
  useEffect(() => {
    if (wsConnected && !authOk && sendMessage) {
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('access_token') || 
                    localStorage.getItem('auth_token');
      if (token) {
        console.log('🔐 Reenviando token de autenticación...');
        try {
          sendMessage({ type: 'auth', token });
        } catch (err) {
          console.error('❌ Error enviando auth:', err);
        }
      }
    }
  }, [wsConnected, authOk, sendMessage]);

  // 2.6) Escuchar eventos de actualización de token (desde AuthContext)
  useEffect(() => {
    const handleTokenUpdate = () => {
      if (wsConnected && sendMessage) {
        const token = localStorage.getItem('accessToken') || 
                      localStorage.getItem('token') || 
                      localStorage.getItem('access_token') || 
                      localStorage.getItem('auth_token');
        if (token) {
          console.log('🔐 Token actualizado, re-autenticando WebSocket...');
          try {
            sendMessage({ type: 'auth', token });
            setAuthOk(false); // Reset para esperar nueva confirmación
          } catch (err) {
            console.error('❌ Error re-autenticando:', err);
          }
        }
      }
    };

    window.addEventListener('token-updated', handleTokenUpdate);
    return () => window.removeEventListener('token-updated', handleTokenUpdate);
  }, [wsConnected, sendMessage]);

  // 3) Derivar estado de conexión + error
  useEffect(() => {
    setIsConnected(Boolean(wsConnected && authOk));
    setError(wsError);
  }, [wsConnected, authOk, wsError]);

  // 4) Manejar mensajes
  useEffect(() => {
    if (!lastMessage) return;

    console.log('📨 WebSocket message received:', lastMessage);

    if (lastMessage.type === 'auth_ok') {
      console.log('✅ WebSocket authenticated, user_id:', lastMessage.user_id);
      setAuthOk(true);
      setError(null);
      return;
    }
    if (lastMessage.type === 'sensor_data') {
      const d = lastMessage.data || {};
      setSensorData((prev) => ({
        ...prev,
        temperature: d.temperature ?? prev.temperature,
        humidity: d.humidity ?? prev.humidity,
        co: d.co ?? prev.co,
        // Mantener pm25 y co2 si vienen, sino mantener valores previos
        pm25: d.pm25 ?? prev.pm25,
        co2: d.co2 ?? prev.co2,
      }));
      setLastUpdate(lastMessage.timestamp ? new Date(lastMessage.timestamp) : new Date());
      setError(null);
      return;
    }
    if (lastMessage.type === 'error') {
      console.error('❌ WebSocket error:', lastMessage.error);
      setError(lastMessage.error || 'Error de WebSocket');
      if (lastMessage.error === 'token_invalido') {
        setAuthOk(false);
        // Intentar reconexión con nuevo token si es posible
      }
      return;
    }
  }, [lastMessage]);

  // 5) Cálculo de calidad del aire basado en los datos de sensores
  useEffect(() => {
    const { temperature, humidity, co, pm25, co2 } = sensorData;
    
    // Calcular score base (0-100)
    let score = 100;
    let category = 'buena';
    let description = 'La calidad del aire es excelente.';
    let recommendation = 'Mantén las ventanas abiertas para una buena ventilación.';

    // Penalizar por temperatura fuera de rango óptimo (18-25°C)
    if (temperature < 18 || temperature > 25) {
      score -= 10;
      if (temperature < 15 || temperature > 30) score -= 15;
    }

    // Penalizar por humedad fuera de rango óptimo (40-60%)
    if (humidity < 40 || humidity > 60) {
      score -= 10;
      if (humidity < 30 || humidity > 70) score -= 15;
    }

    // Penalizar por CO (0-9 ppm es seguro)
    if (co > 9) {
      score -= 20;
      if (co > 35) score -= 30; // Niveles peligrosos
    }

    // Penalizar por PM2.5 (si está disponible)
    if (pm25 > 35) {
      score -= 15;
      if (pm25 > 75) score -= 25;
    }

    // Penalizar por CO2 (si está disponible)
    if (co2 > 800) {
      score -= 10;
      if (co2 > 1200) score -= 20;
    }

    // Asegurar que el score esté en rango 0-100
    score = Math.max(0, Math.min(100, score));

    // Determinar categoría
    if (score >= 80) {
      category = 'buena';
      description = 'La calidad del aire es excelente. Las condiciones son ideales para actividades normales.';
      recommendation = 'Mantén las ventanas abiertas para una buena ventilación.';
    } else if (score >= 60) {
      category = 'moderada';
      description = 'La calidad del aire es aceptable, pero algunos grupos sensibles pueden experimentar molestias.';
      recommendation = 'Considera ventilar el espacio y reducir actividades intensas al aire libre.';
    } else {
      category = 'mala';
      description = 'La calidad del aire no es saludable. Se recomienda precaución.';
      recommendation = 'Evita actividades al aire libre intensas. Ventila adecuadamente y considera usar equipos de purificación de aire si es necesario.';
    }

    setAirQuality({
      score: Math.round(score),
      category,
      description,
      recommendation
    });
  }, [sensorData]);

  const clearSessionData = () => {
    setSensorData({ temperature: 0, humidity: 0, co: 0, pm25: 0, co2: 0 });
    setLastUpdate(null);
    setError(null);
    setAuthOk(false);
    disconnect?.();
  };

  const value = useMemo(() => ({
    sensorData,
    lastUpdate,
    isConnected,
    error,
    airQuality,
    authPending,     // 👈 nuevo
    connecting,      // 👈 nuevo
    clearSessionData,
    // helpers de UI
    getTemperaturePercentage: () => Math.min(Math.max(sensorData.temperature, 0), 50),
    getHumidityPercentage:   () => Math.min(Math.max(sensorData.humidity, 0), 100),
    getCOPercentage:         () => Math.min(Math.max(sensorData.co, 0), 100),
  }), [sensorData, lastUpdate, isConnected, error, airQuality, authPending, connecting]);

  return (
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensorData = () => {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensorData debe usarse dentro de SensorProvider');
  return ctx;
};
