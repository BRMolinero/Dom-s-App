import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWebSocket (mejorado)
 * - Singleton por URL para evitar múltiples conexiones en dev/HMR
 * - Reconexión con backoff lineal
 * - Heartbeat opcional
 * - NUEVO: deferConnect para esperar a que exista el token
 * - NUEVO: exposing `connecting`
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
    closeOnUnmount = false,
    deferConnect = false, // 👈 NUEVO
  } = {},
) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connecting, setConnecting] = useState(false); // 👈 NUEVO

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
          /* ignore */
        }
      }
    }, heartbeatInterval);
  }, [enableHeartbeat, heartbeatInterval]);

  const connect = useCallback(() => {
    setConnecting(true);

    const cacheKey = `__DOMUS_WS_${url}__`;
    const cached = globalRef[cacheKey];
    if (cached && cached.readyState === WebSocket.OPEN) {
      setSocket(cached);
      setIsConnected(true);
      setError(null);
      startHeartbeat(cached);
      setConnecting(false);
      
      // Mantener los listeners actuales también en el socket cacheado
      // Esto asegura que los mensajes se procesen correctamente
      cached.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'pong') return;
          setLastMessage(data);
        } catch (err) {
          console.error('❌ WS message parse error:', err, 'raw:', event.data);
        }
      };
      
      // Reenviar token de autenticación en caso de que sea necesario
      try {
        const token =
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('auth_token');
        if (token) {
          console.log('🔐 Reenviando auth en socket cacheado...');
          cached.send(JSON.stringify({ type: 'auth', token }));
        }
      } catch {/* ignore */}
      
      return;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado, enviando autenticación...');
        // Adjuntar a cache global
        globalRef[cacheKey] = ws;
        setSocket(ws);
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Enviar token si existe
        try {
          const token =
            localStorage.getItem('accessToken') ||
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            localStorage.getItem('auth_token');
          if (token) {
            console.log('🔐 Enviando token de autenticación...');
            ws.send(JSON.stringify({ type: 'auth', token }));
          } else {
            console.warn('⚠️ No se encontró token para autenticación WebSocket');
          }
        } catch (err) {
          console.error('❌ Error obteniendo token:', err);
        }

        startHeartbeat(ws);
        setConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'pong') return;
          setLastMessage(data);
        } catch (err) {
          console.error('❌ WS message parse error:', err, 'raw:', event.data);
        }
      };

      ws.onerror = (e) => {
        console.error('❌ WebSocket error:', e);
        setError('Error de conexión WebSocket');
        setConnecting(false);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setSocket(null);
        clearTimers();
        setConnecting(false);

        // No reconectar si cierre limpio (1000) y lo cerramos manualmente, o si autoReconnect=false
        const clean = event.code === 1000 || intentionallyClosed.current;
        if (!autoReconnect || clean) return;

        // Backoff lineal
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = reconnectInterval * (reconnectAttempts.current + 1);
          reconnectAttempts.current += 1;
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
      setConnecting(false);
    }
  }, [url, autoReconnect, reconnectInterval, maxReconnectAttempts, startHeartbeat]);

  const disconnect = useCallback(() => {
    intentionallyClosed.current = true;
    try {
      socket?.close(1000, 'disconnect requested');
    } catch {/* ignore */}
    clearTimers();
  }, [socket]);

  const forceReconnect = useCallback(() => {
    intentionallyClosed.current = false;
    try {
      socket?.close(4000, 'force reconnect');
    } catch {/* ignore */}
  }, [socket]);

  const sendMessage = useCallback((payload) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket no está conectado');
    }
    const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
    socket.send(msg);
  }, [socket]);

  useEffect(() => {
    intentionallyClosed.current = false;
    if (!deferConnect) connect();

    return () => {
      if (closeOnUnmount) disconnect();
      else clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect, closeOnUnmount, deferConnect]);

  return {
    socket,
    isConnected,
    error,
    lastMessage,
    connecting, // 👈 NUEVO
    sendMessage,
    connect,
    disconnect,
    forceReconnect,
  };
}
