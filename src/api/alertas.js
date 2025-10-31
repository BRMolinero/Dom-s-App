import { api } from './http';

/**
 * Crear una nueva alerta
 * @param {object} alertaData - Datos de la alerta
 * @param {number} alertaData.dispositivo_id - ID del dispositivo
 * @param {string} alertaData.tipo_alerta - Tipo de alerta (ej: "temperatura_alta")
 * @param {string} alertaData.descripcion - Descripción de la alerta
 * @param {number} alertaData.valor_actual - Valor actual que disparó la alerta
 * @param {string} alertaData.severidad - Severidad: "baja", "media", "alta", "critica"
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function crearAlerta(alertaData) {
  try {
    const { data } = await api.post('/alertas', alertaData);
    return data;
  } catch (error) {
    console.error('Error al crear alerta:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.mensaje || 'No se pudo crear la alerta');
  }
}

/**
 * Obtener alertas con filtros opcionales
 * @param {object} filtros - Filtros opcionales
 * @param {boolean} filtros.leida - Filtrar por estado de lectura (true/false)
 * @param {string} filtros.severidad - Filtrar por severidad ("baja", "media", "alta", "critica")
 * @param {number} filtros.dispositivo_id - Filtrar por dispositivo
 * @returns {Promise<object>} Objeto con total y data de alertas
 */
export async function obtenerAlertas(filtros = {}) {
  try {
    const params = new URLSearchParams();
    if (filtros.leida !== undefined) params.append('leida', filtros.leida);
    if (filtros.severidad) params.append('severidad', filtros.severidad);
    if (filtros.dispositivo_id) params.append('dispositivo_id', filtros.dispositivo_id);
    
    const queryString = params.toString();
    const url = queryString ? `/alertas?${queryString}` : '/alertas';
    
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.mensaje || 'No se pudieron obtener las alertas');
  }
}

/**
 * Obtener solo alertas no leídas
 * @returns {Promise<object>} Objeto con total y data de alertas no leídas
 */
export async function obtenerAlertasNoLeidas() {
  try {
    const { data } = await api.get('/alertas/no-leidas');
    return data;
  } catch (error) {
    console.error('Error al obtener alertas no leídas:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.mensaje || 'No se pudieron obtener las alertas no leídas');
  }
}

/**
 * Marcar una alerta como leída
 * @param {number} alertaId - ID de la alerta a marcar como leída
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function marcarAlertaComoLeida(alertaId) {
  try {
    const { data } = await api.put(`/alertas/${alertaId}/leer`);
    return data;
  } catch (error) {
    console.error('Error al marcar alerta como leída:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.mensaje || 'No se pudo marcar la alerta como leída');
  }
}


