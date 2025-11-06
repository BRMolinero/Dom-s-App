import { api } from "./http";

/**
 * Obtener datos de sensores con filtros
 * @param {Object} params - Parámetros de filtrado
 * @param {number} params.limite - Límite de registros (default: 100)
 * @param {string} params.tipo_sensor - Tipo de sensor a filtrar
 * @param {number} params.dispositivo_id - ID del dispositivo
 * @returns {Promise<Object>} Datos de sensores
 */
export async function getSensors(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.limite) queryParams.append('limite', params.limite);
  if (params.tipo_sensor) queryParams.append('tipo_sensor', params.tipo_sensor);
  if (params.dispositivo_id) queryParams.append('dispositivo_id', params.dispositivo_id);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/sensors?${queryString}` : '/sensors';
  
  const { data } = await api.get(url);
  return data;
}

/**
 * Guardar un dato de sensor
 * @param {Object} sensorData - Datos del sensor
 * @param {number} sensorData.dispositivo_id - ID del dispositivo
 * @param {string} sensorData.tipo_sensor - Tipo de sensor
 * @param {number} sensorData.valor - Valor del sensor
 * @param {string} sensorData.unidad - Unidad de medida
 * @param {Object} sensorData.metadata - Metadatos adicionales (opcional)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function createSensor(sensorData) {
  const { data } = await api.post('/sensors', sensorData);
  return data;
}

/**
 * Guardar múltiples datos de sensores en batch
 * @param {Object} batchData - Datos del batch
 * @param {number} batchData.dispositivo_id - ID del dispositivo
 * @param {Array} batchData.datos - Array de datos de sensores
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function createSensorBatch(batchData) {
  const { data } = await api.post('/sensors/batch', batchData);
  return data;
}

/**
 * Obtener estadísticas de un dispositivo
 * @param {number} dispositivoId - ID del dispositivo
 * @param {string} tipoSensor - Tipo de sensor (opcional)
 * @returns {Promise<Object>} Estadísticas del dispositivo
 */
export async function getDeviceStats(dispositivoId, tipoSensor = null) {
  const queryString = tipoSensor 
    ? `?tipo_sensor=${encodeURIComponent(tipoSensor)}` 
    : '';
  
  const { data } = await api.get(`/sensors/stats/${dispositivoId}${queryString}`);
  return data;
}

/**
 * Obtener datos por tipo de sensor
 * @param {string} tipoSensor - Tipo de sensor
 * @param {number} limite - Límite de registros (default: 50)
 * @returns {Promise<Object>} Datos del tipo de sensor
 */
export async function getSensorsByType(tipoSensor, limite = 50) {
  const { data } = await api.get(`/sensors/tipo/${encodeURIComponent(tipoSensor)}?limite=${limite}`);
  return data;
}

/**
 * Obtener estadísticas públicas (sin autenticación)
 * @returns {Promise<Object>} Estadísticas públicas
 */
export async function getPublicStats() {
  const { data } = await api.get('/sensors/estadisticas-publicas');
  return data;
}

/**
 * Obtener los últimos valores de temperatura, humedad y gas del robot MQTT
 * @returns {Promise<Object>} Objeto con { temperatura, humedad, gas }
 */
export async function getUltimosValoresSensor() {
  try {
    const { data } = await api.get('/mqttRobot/api/sensores');
    return {
      temperatura: data.temperatura || 0,
      humedad: data.humedad || 0,
      gas: data.gas || 0
    };
  } catch (error) {
    console.error('Error al obtener últimos valores de sensores:', error);
    throw new Error(error.response?.data?.msg || 'No se pudieron obtener los datos del robot');
  }
}

/**
 * Tipos de sensores comunes
 */
export const SENSOR_TYPES = {
  TEMPERATURA: 'temperatura',
  HUMEDAD: 'humedad',
  PRESION: 'presion',
  LUZ: 'luz',
  MOVIMIENTO: 'movimiento',
  SONIDO: 'sonido',
  DISTANCIA: 'distancia',
  CALIDAD_AIRE: 'co',
  CO: 'co',
  CO2: 'co2',
  PM25: 'pm25',
  RUIDO: 'ruido'
};

/**
 * Unidades comunes para sensores
 */
export const SENSOR_UNITS = {
  CELSIUS: '°C',
  FAHRENHEIT: '°F',
  PERCENTAGE: '%',
  PASCAL: 'Pa',
  LUX: 'lux',
  DECIBEL: 'dB',
  METER: 'm',
  CENTIMETER: 'cm',
  PPM: 'ppm'
};

