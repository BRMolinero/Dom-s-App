import { api } from './http';

/**
 * Configurar número de teléfono para SOS
 * @param {string} telefono - Número de teléfono a configurar
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function configurarTelefonoSOS(telefono) {
  try {
    const { data } = await api.post('/sos/configurar-telefono', { telefono_sos: telefono });
    return data;
  } catch (error) {
    console.error('Error al configurar teléfono SOS:', error);
    throw new Error(error.response?.data?.error || 'No se pudo configurar el teléfono SOS');
  }
}

/**
 * Obtener configuración SOS del usuario
 * @returns {Promise<object>} Configuración SOS
 */
export async function obtenerConfiguracionSOS() {
  try {
    const { data } = await api.get('/sos/configuracion');
    return data;
  } catch (error) {
    console.error('Error al obtener configuración SOS:', error);
    throw new Error(error.response?.data?.error || 'No se pudo obtener la configuración SOS');
  }
}

/**
 * Eliminar número SOS configurado
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function eliminarTelefonoSOS() {
  try {
    const { data } = await api.delete('/sos/eliminar-telefono');
    return data;
  } catch (error) {
    console.error('Error al eliminar teléfono SOS:', error);
    throw new Error(error.response?.data?.error || 'No se pudo eliminar el teléfono SOS');
  }
}

/**
 * Validar formato de teléfono internacional
 * @param {string} telefono - Número de teléfono a validar
 * @returns {boolean} true si es válido
 */
export function validarTelefonoInternacional(telefono) {
  // Valida formato internacional: +[código país][número]
  const pattern = /^\+[1-9]\d{7,14}$/;
  return pattern.test(telefono);
}

/**
 * Formatear número de teléfono a formato internacional
 * @param {string} telefono - Número de teléfono
 * @returns {string} Número formateado
 */
export function formatearTelefono(telefono) {
  // Limpiar el teléfono de espacios y caracteres especiales
  let cleaned = telefono.replace(/[\s\-\(\)]/g, '');
  
  // Si no empieza con +, agregarlo
  if (!cleaned.startsWith('+')) {
    // Si no empieza con 0, asumir que es el prefijo del país
    if (cleaned.startsWith('0')) {
      cleaned = '+' + cleaned.substring(1);
    } else if (cleaned.startsWith('54')) {
      // Argentina
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('9')) {
      // Número local de Argentina con 9 al inicio
      cleaned = '+549' + cleaned.substring(1);
    } else {
      // Intentar agregar código de Argentina por defecto
      cleaned = '+549' + cleaned;
    }
  }
  
  return cleaned;
}
