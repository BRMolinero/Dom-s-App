import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook WebSocket:
 * - Singleton por URL (evita múltiples conexiones en dev/StrictMode/HMR)
 * - Reconexión con backoff lineal simple
 * - Heartbeat (ping/pong) opcional
 */
const globalRef = typeof window !== 'undefined' ? window : globalThis;

export default function useWebSocket(
  url,
  {
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    autoReconnect = true,
    enableHeartbeat = true,
    heartbeatInterval = 25000,
    closeOnUnmount = false, // en dev, mejor dejar false para evitar loop con código 1000
  } = {}
) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  const reconnectTimeoutRef = useRef(null);
  const heartbeatRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const intentionallyClosed = useRef(false);

  // ---- helpers ----
  const clearTimers = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const startHeartbeat = useCallback((ws) => {
    if (!enableHeartbeat) return;
    clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        } catch {
          // silencioso
        }
      }
    }, heartbeatInterval);
  }, [enableHeartbeat, heartbeatInterval]);

  const connect = useCallback(() => {
    // Reusar conexión global si existe y está OPEN (singleton por URL)
    const cacheKey = `__DOMUS_WS_${url}__`;
    const cached = globalRef[cacheKey];
    if (cached && cached.readyState === WebSocket.OPEN) {
      setSocket(cached);
      setIsConnected(true);
      setError(null);
      startHeartbeat(cached);
      return;
    }

    try {
      console.log(`🔌 Conectando a WebSocket: ${url}`);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        const token =
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('auth_token');

        if (token) {
          console.log('🔐 Enviando token de autenticación al WebSocket');
          ws.send(JSON.stringify({ type: 'auth', token }));
        } else {
          console.warn('⚠️ No hay token en localStorage para WebSocket');
        }

        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        setSocket(ws);
        globalRef[cacheKey] = ws;
        startHeartbeat(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'pong') return; // ignorar pongs
          setLastMessage(data);
        } catch (err) {
          console.error('❌ WS message parse error:', err, 'raw:', event.data);
        }
      };

      ws.onerror = (e) => {
        console.error('❌ WebSocket error:', e);
        setError('Error de conexión WebSocket');
      };

      ws.onclose = (event) => {
        console.log('❌ WebSocket cerrado:', event.code, event.reason || 'Sin razón');
        setIsConnected(false);
        setSocket(null);
        clearTimers();

        // No reconectar si cierre limpio (1000), cierre intencional o autoReconnect off
        if (event.code === 1000 || intentionallyClosed.current || !autoReconnect) return;

        // Reconexión con intentos limitados (backoff lineal simple)
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = reconnectInterval * reconnectAttempts.current;
          console.log(`🔄 Reintentando en ${delay}ms (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('No se pudo reconectar al WebSocket');
        }
      };
    } catch (err) {
      console.error('❌ Error creando WebSocket:', err);
      setError('Error creando conexión WebSocket');
    }
  }, [url, autoReconnect, reconnectInterval, maxReconnectAttempts, startHeartbeat]);

  const disconnect = useCallback(() => {
    intentionallyClosed.current = true;
    clearTimers();
    if (socket && socket.readyState === WebSocket.OPEN) {
      // cierre limpio; evita reconexión
      socket.close(1000, 'Desconexión intencional');
    }
  }, [socket]);

  const sendMessage = useCallback((message) => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WS no está conectado; no se envió el mensaje');
    }
  }, [socket, isConnected]);

  const forceReconnect = useCallback(() => {
    // Forzar un reconnect manual (por si querés botón)
    intentionallyClosed.current = false;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(4000, 'Force reconnect'); // no 1000 => permitirá reconectar
    } else {
      connect();
    }
  }, [socket, connect]);

  useEffect(() => {
    intentionallyClosed.current = false;
    connect();
    return () => {
      // En dev/StrictMode, cerrar aquí con 1000 puede generar bucles; por eso es opcional
      if (closeOnUnmount) disconnect();
      else clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect, closeOnUnmount]);

  return {
    socket,
    isConnected,
    error,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    forceReconnect,
  };
}
