import { api } from './http';

/**
 * Parar el robot
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function pararRobot() {
  try {
    const { data } = await api.post('/robot/parar');
    return data;
  } catch (error) {
    console.error('Error al parar el robot:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'No se pudo parar el robot');
  }
}

/**
 * Reanudar el robot (usar endpoint /robot/mover)
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function reanudarRobot() {
  try {
    // Payload mínimo para reanudar: mover hacia adelante a velocidad baja
    // Si el backend requiere otros campos, ajustar según la respuesta del servidor
    const payload = {
      direccion: 'adelante',
      velocidad: 50, // Velocidad baja por seguridad
      modo: 'auto' // Si el backend lo soporta
    };
    
    const { data } = await api.post('/robot/mover', payload);
    return data;
  } catch (error) {
    console.error('Error al reanudar el robot:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'No se pudo reanudar el robot');
  }
}

