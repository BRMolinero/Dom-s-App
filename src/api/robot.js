import { api } from './http';

/**
 * Parar el robot (usando endpoint /apagar)
 * @param {number} dispositivo_id - ID del dispositivo (por defecto 1)
 * @returns {Promise<object>} Respuesta del servidor con estructura: { exito, mensaje, estado, dispositivo_id, comando_mqtt, timestamp }
 */
export async function pararRobot(dispositivo_id = 1) {
  try {
    const { data } = await api.post('/apagar', { dispositivo_id });
    // El backend devuelve: { exito, mensaje, estado, dispositivo_id, comando_mqtt, timestamp }
    return data;
  } catch (error) {
    console.error('Error al parar el robot:', error);
    // El backend puede devolver { error, detalle } o { error } o { message }
    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al apagar robot';
    const detalle = error.response?.data?.detalle;
    throw new Error(detalle ? `${errorMsg}: ${detalle}` : errorMsg);
  }
}

/**
 * Reanudar/Encender el robot (usando endpoint /encender)
 * @param {number} dispositivo_id - ID del dispositivo (por defecto 1)
 * @returns {Promise<object>} Respuesta del servidor con estructura: { exito, mensaje, estado, dispositivo_id, comando_mqtt, timestamp }
 */
export async function reanudarRobot(dispositivo_id = 1) {
  try {
    const { data } = await api.post('/encender', { dispositivo_id });
    // El backend devuelve: { exito, mensaje, estado, dispositivo_id, comando_mqtt, timestamp }
    return data;
  } catch (error) {
    console.error('Error al reanudar el robot:', error);
    // El backend puede devolver { error, detalle } o { error } o { message }
    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al encender robot';
    const detalle = error.response?.data?.detalle;
    throw new Error(detalle ? `${errorMsg}: ${detalle}` : errorMsg);
  }
}

