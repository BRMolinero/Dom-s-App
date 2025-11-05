import axios from "axios";
import { api } from "./http";

/**
 * Analizar calidad de aire usando el endpoint de IA
 * El endpoint real es: GET /api/ia/analizar
 * @returns {Promise<Object>} Respuesta del análisis de IA con datos de calidad de aire
 */
export async function analizarCalidadAire() {
  try {
    // El endpoint correcto es GET /api/ia/analizar
    const url = "/ia/analizar";
    console.log('🔍 Llamando a GET /api/ia/analizar');
    
    // Usar el cliente api configurado que ya tiene la baseURL con /api
    const { data } = await api.get(url);
    console.log('✅ Respuesta exitosa desde GET /api/ia/analizar');
    console.log('📦 Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en analizarCalidadAire:', error);
    
    // Mejorar el manejo de errores
    if (error.response) {
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
          'Error interno del servidor. El análisis de IA no pudo procesarse.';
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
      throw new Error("No se pudo conectar al servidor. Verifique que el backend esté ejecutándose.");
    } else {
      // Otro tipo de error
      throw error;
    }
  }
}

