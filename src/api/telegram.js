import { api } from './http';

/**
 * Configurar chat_id de Telegram
 * @param {string} chatId - Chat ID de Telegram a configurar
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function configurarChatIdTelegram(chatId) {
  try {
    const { data } = await api.post('/telegram/configurar-chat-id', { chat_id_telegram: chatId });
    return data;
  } catch (error) {
    console.error('Error al configurar chat_id de Telegram:', error);
    throw new Error(error.response?.data?.error || 'No se pudo configurar el chat_id de Telegram');
  }
}

/**
 * Obtener configuración de Telegram del usuario
 * @returns {Promise<object>} Configuración de Telegram
 */
export async function obtenerConfiguracionTelegram() {
  try {
    const { data } = await api.get('/telegram/configuracion');
    return data;
  } catch (error) {
    console.error('Error al obtener configuración de Telegram:', error);
    throw new Error(error.response?.data?.error || 'No se pudo obtener la configuración de Telegram');
  }
}

/**
 * Eliminar chat_id de Telegram configurado
 * @returns {Promise<object>} Respuesta del servidor
 */
export async function eliminarChatIdTelegram() {
  try {
    const { data } = await api.delete('/telegram/eliminar-chat-id');
    return data;
  } catch (error) {
    console.error('Error al eliminar chat_id de Telegram:', error);
    throw new Error(error.response?.data?.error || 'No se pudo eliminar el chat_id de Telegram');
  }
}

/**
 * Validar formato de chat_id de Telegram
 * @param {string} chatId - Chat ID de Telegram a validar
 * @returns {boolean} true si es válido
 */
export function validarChatIdTelegram(chatId) {
  // Valida formato de chat_id de Telegram: puede ser un número (positivo o negativo) o string
  // Ejemplos válidos: "123456789", "-123456789", "1234567890"
  const pattern = /^-?\d{9,}$/;
  return pattern.test(chatId);
}

/**
 * Formatear chat_id de Telegram
 * @param {string} chatId - Chat ID de Telegram
 * @returns {string} Chat ID formateado
 */
export function formatearChatIdTelegram(chatId) {
  // Limpiar el chat_id de espacios y caracteres especiales
  let cleaned = chatId.trim().replace(/\s+/g, '');
  
  // Si es un número válido, retornarlo
  if (/^-?\d+$/.test(cleaned)) {
    return cleaned;
  }
  
  return cleaned;
}

