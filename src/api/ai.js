import axios from "axios";
import { api } from "./http";

// Control de carrera: evitar múltiples peticiones simultáneas
let reqCounter = 0;
let currentRequest = null;

/**
 * Analizar calidad de aire usando el endpoint de IA
 * El endpoint real es: GET /api/ia/analizar
 * @returns {Promise<Object>} Respuesta del análisis de IA con datos de calidad de aire
 */
export async function analizarCalidadAire() {
  // Incrementar contador de peticiones
  reqCounter++;
  const requestId = reqCounter;
  
  // Si hay una petición en curso, esperar a que termine
  if (currentRequest) {
    console.log(`⏳ Petición ${requestId}: Esperando a que termine la petición anterior...`);
    try {
      await currentRequest;
    } catch (e) {
      // Ignorar errores de la petición anterior
    }
  }
  
  // Crear un cliente axios específico con timeout aumentado para IA
  const aiApi = axios.create({
    baseURL: api.defaults.baseURL,
    timeout: 45000, // 45 segundos para dar tiempo a Render y OpenAI
    withCredentials: true,
    headers: {
      ...(api.defaults.headers.common || {}),
    }
  });
  
  // Agregar token de autorización si existe
  const token = localStorage.getItem('accessToken');
  if (token) {
    aiApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Crear la promesa de la petición actual
  const requestPromise = (async () => {
    try {
      const url = "/ia/analizar";
      console.log(`🔍 [Petición ${requestId}] Llamando a GET /api/ia/analizar`);
      
      const { data } = await aiApi.get(url);
      console.log(`✅ [Petición ${requestId}] Respuesta exitosa desde GET /api/ia/analizar`);
      console.log(`📦 [Petición ${requestId}] Datos recibidos:`, data);
      return data;
    } catch (error) {
      console.error(`❌ [Petición ${requestId}] Error en analizarCalidadAire:`, error);
      
      // Mejorar el manejo de errores con mensajes más claros
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        // Error de timeout
        const timeoutMsg = 'El análisis de IA está tardando más de lo esperado. Por favor, intenta nuevamente en unos momentos.';
        const timeoutErr = new Error(timeoutMsg);
        timeoutErr.isTimeout = true;
        throw timeoutErr;
      } else if (error.response) {
        // Error con respuesta del servidor
        const status = error.response.status;
        const errorData = error.response.data || {};
        
        // Mensajes específicos según el código de estado
        let errorMsg;
        if (status === 404) {
          errorMsg = errorData.error || errorData.mensaje || errorData.message || 
            'Ruta no encontrada: GET /api/ia/analizar. Verifique que el endpoint esté disponible en el backend.';
        } else if (status === 500) {
          errorMsg = errorData.error || errorData.mensaje || errorData.message || 
            'Error interno del servidor. El análisis de IA no pudo procesarse. Por favor, intenta nuevamente más tarde.';
        } else if (status === 503) {
          errorMsg = errorData.error || errorData.mensaje || errorData.message || 
            'El servidor está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.';
        } else {
          errorMsg = errorData.mensaje || errorData.message || errorData.error || 
            `Error ${status}: ${error.message}`;
        }
        
        const newErr = new Error(errorMsg);
        newErr.response = {
          status: status,
          data: errorData
        };
        throw newErr;
      } else if (error.request) {
        // Error de conexión (sin respuesta del servidor)
        throw new Error("No se pudo conectar al servidor. Verifica tu conexión a internet y que el backend esté ejecutándose.");
      } else {
        // Otro tipo de error
        throw error;
      }
    } finally {
      // Limpiar la petición actual si es la última
      if (currentRequest === requestPromise) {
        currentRequest = null;
      }
    }
  })();
  
  // Guardar la petición actual
  currentRequest = requestPromise;
  
  return requestPromise;
}

