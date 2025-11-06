import React, { useState, useEffect } from 'react';
import {
  FaTint,
  FaWind,
  FaExclamationTriangle,
  FaThermometerHalf,
  FaLeaf,
  FaSync
} from 'react-icons/fa';
import LoadingMessage from '../../components/LoadingMessage';
import { useSensorData } from '../../context/SensorContext';
import AlertasPanel from '../../components/AlertasPanel';
import { analizarCalidadAire } from '../../api/ai';
import { getUltimosValoresSensor } from '../../api/sensors';
import { crearAlerta } from '../../api/alertas';

const AdminPanel = () => {
  const {
    sensorData,
    lastUpdate,
    isConnected,
    error,
    airQuality,
    getTemperaturePercentage,
    getHumidityPercentage,
    getCOPercentage
  } = useSensorData();

  // Mostrar loading solo si no hay conexión y no hay datos
  // Agregar un timeout para que no quede cargando indefinidamente
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  
  // Estado para datos de calidad de aire del backend
  const [airQualityFromBackend, setAirQualityFromBackend] = useState(null);
  const [loadingAirQuality, setLoadingAirQuality] = useState(false);
  const [errorAirQuality, setErrorAirQuality] = useState(null);
  
  // Estado para datos de sensores del endpoint /api/sensors/ultimos-valores
  const [valoresSensor, setValoresSensor] = useState({
    temperatura: 0,
    humedad: 0,
    gas: 0
  });
  const [loadingSensorData, setLoadingSensorData] = useState(false);
  const [errorSensorData, setErrorSensorData] = useState(null);
  
  // Control de alertas ya creadas para evitar duplicados
  const [alertasCreadas, setAlertasCreadas] = useState(new Set());
  
  // Estado previo para detectar cambios de rango (dentro -> fuera)
  const [estadoAnterior, setEstadoAnterior] = useState({
    temperatura: null,
    humedad: null,
    gas: null
  });
  
  // Rangos definidos (basados en SensorContext y umbrales SOS)
  const RANGOS = {
    temperatura: {
      min_optimo: 18,
      max_optimo: 25,
      min_peligroso: 15,
      max_peligroso: 30,
      max_critico: 40 // Umbral SOS
    },
    humedad: {
      min_optimo: 40,
      max_optimo: 60,
      min_peligroso: 30,
      max_peligroso: 70
    },
    gas: {
      max_seguro: 80, // Temporalmente cambiado a 80
      max_peligroso: 35,
      max_critico: 50 // Umbral SOS
    }
  };
  
  // Función para verificar si un valor está dentro de rango
  const estaDentroDeRango = (tipo, valor) => {
    if (tipo === 'temperatura') {
      return valor >= RANGOS.temperatura.min_optimo && valor <= RANGOS.temperatura.max_optimo;
    }
    if (tipo === 'humedad') {
      return valor >= RANGOS.humedad.min_optimo && valor <= RANGOS.humedad.max_optimo;
    }
    if (tipo === 'gas') {
      return valor <= RANGOS.gas.max_seguro;
    }
    return true;
  };
  
  // Función para procesar y mapear datos del backend
  const procesarDatosBackend = (data) => {
    console.log('📊 Procesando datos del backend:', data);
    
    if (!data?.message) {
      console.warn('⚠️ No hay campo message en la respuesta');
      return null;
    }
    
    // El message puede venir como string JSON o como objeto
    let message;
    try {
      // Intentar parsear si es string
      if (typeof data.message === 'string') {
        console.log('🔧 Parseando message como string JSON...');
        message = JSON.parse(data.message);
        console.log('✅ Message parseado:', message);
      } else {
        console.log('✅ Message ya es un objeto');
        message = data.message;
      }
    } catch (e) {
      console.error('❌ Error al parsear message:', e);
      console.error('📄 Contenido del message:', data.message);
      return null;
    }
    
    // Validar que tenga los campos necesarios
    if (!message.calidad_aire) {
      console.warn('⚠️ No hay calidad_aire en el message');
      return null;
    }
    
    // Mapear calidad_aire a score y category
    const calidadAireMap = {
      'Excelente': { score: 100, category: 'buena' },
      'Muy buena': { score: 90, category: 'buena' },
      'Buena': { score: 75, category: 'buena' },
      'Mala': { score: 45, category: 'mala' },
      'Muy mala': { score: 20, category: 'mala' }
    };
    
    const calidadInfo = calidadAireMap[message.calidad_aire] || { score: 50, category: 'moderada' };
    
    // Crear descripción basada en los datos (solo calidad de aire y nivel de riesgo)
    let description = `La calidad del aire es ${message.calidad_aire} y el nivel de riesgo es ${message.nivel_riesgo || 'No especificado'}.`;
    
    const processed = {
      score: calidadInfo.score,
      category: calidadInfo.category,
      description: description,
      recommendation: message.recomendacion || 'Sin recomendación disponible.',
      nivelRiesgo: message.nivel_riesgo,
      calidadAire: message.calidad_aire,
      datosRelevantes: message.datos_relevantes
    };
    
    console.log('✅ Datos procesados finales:', processed);
    return processed;
  };
  
  // Cargar datos de sensores del endpoint
  const cargarDatosSensor = async () => {
    setLoadingSensorData(true);
    setErrorSensorData(null);
    
    try {
      const datos = await getUltimosValoresSensor();
      setValoresSensor({
        temperatura: datos.temperatura || 0,
        humedad: datos.humedad || 0,
        gas: datos.gas || 0
      });
    } catch (error) {
      console.error('Error al cargar datos de sensores:', error);
      setErrorSensorData(error.message || 'Error al obtener datos de sensores');
    } finally {
      setLoadingSensorData(false);
    }
  };
  
  // Cargar datos de calidad de aire del backend
  const cargarCalidadAire = async () => {
    // Limpiar error al reintentar
    setErrorAirQuality(null);
    setLoadingAirQuality(true);
    
    try {
      console.log('🔄 Iniciando carga de calidad de aire...');
      
      const response = await analizarCalidadAire();
      console.log('📦 Respuesta del backend:', response);
      
      const processedData = procesarDatosBackend(response);
      console.log('✅ Datos procesados:', processedData);
      
      if (!processedData) {
        throw new Error('No se pudieron procesar los datos del backend');
      }
      
      setAirQualityFromBackend(processedData);
      // Limpiar error si la carga fue exitosa
      setErrorAirQuality(null);
    } catch (err) {
      console.error('❌ Error al cargar calidad de aire:', err);
      
      // Mensajes de error más claros
      let errorMessage = err.message || 'Error al obtener los datos de calidad de aire';
      
      if (err.isTimeout) {
        errorMessage = 'El análisis está tardando más de lo esperado. Por favor, intenta nuevamente en unos momentos.';
      } else if (err.response?.status === 404) {
        errorMessage = 'El endpoint de análisis de IA no está disponible. Verifica la configuración del backend.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error interno del servidor. El análisis de IA no pudo procesarse. Por favor, intenta nuevamente más tarde.';
      } else if (err.response?.status === 503) {
        errorMessage = 'El servidor está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.';
      }
      
      setErrorAirQuality(errorMessage);
    } finally {
      setLoadingAirQuality(false);
    }
  };
  
  // Función para verificar si un valor está fuera de rango y crear alerta
  const verificarYCrearAlerta = async (tipo, valor, umbralMin, umbralMax, umbralCritico) => {
    // Verificar si el valor está fuera de rango
    const estaFueraDeRango = !estaDentroDeRango(tipo, valor);
    const estabaDentroDeRango = estadoAnterior[tipo] !== null && estaDentroDeRango(tipo, estadoAnterior[tipo]);
    
    // Solo crear alerta si pasó de estar dentro de rango a fuera de rango
    // o si es la primera vez que se detecta un valor fuera de rango
    if (!estaFueraDeRango) {
      // Si vuelve a estar dentro de rango, permitir crear nueva alerta si sale de nuevo
      setEstadoAnterior(prev => ({ ...prev, [tipo]: valor }));
      return;
    }
    
    // Si ya estaba fuera de rango, no crear alerta duplicada
    if (!estabaDentroDeRango && estadoAnterior[tipo] !== null) {
      // Actualizar estado anterior
      setEstadoAnterior(prev => ({ ...prev, [tipo]: valor }));
      return;
    }
    
    // Crear una clave única basada en el tipo y el estado de fuera de rango
    const alertaKey = `${tipo}_fuera_rango_${Date.now()}`;
    
    // Evitar crear múltiples alertas en menos de 30 segundos para el mismo tipo
    const ultimaAlerta = Array.from(alertasCreadas).find(key => key.startsWith(`${tipo}_fuera_rango`));
    if (ultimaAlerta) {
      const timestamp = parseInt(ultimaAlerta.split('_').pop());
      const ahora = Date.now();
      if (ahora - timestamp < 30000) { // 30 segundos
        return;
      }
    }
    
    let fueraDeRango = false;
    let severidad = 'media';
    let descripcion = '';
    
    // Verificar temperatura - solo crear alerta si es > 30°C
    if (tipo === 'temperatura') {
      if (valor > 30) { // Solo crear alerta si es mayor a 30°C
        fueraDeRango = true;
        if (valor >= umbralCritico || valor < RANGOS.temperatura.min_peligroso) {
          severidad = 'critica';
          descripcion = `⚠️ Temperatura CRÍTICA: ${valor.toFixed(1)}°C. Valor fuera del rango seguro`;
        } else {
          severidad = 'alta';
          descripcion = `⚠️ Temperatura ALTA: ${valor.toFixed(1)}°C. Valor elevado detectado`;
        }
      }
    }
    
    // Verificar humedad - solo crear alerta si es > 80%
    if (tipo === 'humedad') {
      if (valor > 80) { // Solo crear alerta si es mayor a 80%
        fueraDeRango = true;
        if (valor > RANGOS.humedad.max_peligroso) {
          severidad = 'alta';
          descripcion = `⚠️ Humedad FUERA DE RANGO: ${valor.toFixed(1)}%. Valor peligroso detectado`;
        } else {
          severidad = 'media';
          descripcion = `⚠️ Humedad elevada: ${valor.toFixed(1)}%. Valor alto detectado`;
        }
      }
    }
    
    // Verificar gases - solo crear alerta si es > 85 ppm
    if (tipo === 'gas') {
      if (valor > 85) { // Solo crear alerta si es mayor a 85 ppm
        fueraDeRango = true;
        if (valor >= umbralCritico) {
          severidad = 'critica';
          descripcion = `🚨 GAS CRÍTICO: ${valor.toFixed(1)} ppm. Nivel PELIGROSO detectado`;
        } else if (valor > RANGOS.gas.max_peligroso) {
          severidad = 'alta';
          descripcion = `⚠️ Gas PELIGROSO: ${valor.toFixed(1)} ppm. Nivel elevado detectado`;
        } else {
          severidad = 'media';
          descripcion = `⚠️ Gas elevado: ${valor.toFixed(1)} ppm. Nivel alto detectado`;
        }
      }
    }
    
    // Si está fuera de rango, crear la alerta
    if (fueraDeRango) {
      try {
        await crearAlerta({
          dispositivo_id: 1, // ID del dispositivo robot
          tipo_alerta: `${tipo}_fuera_rango`,
          descripcion: descripcion,
          valor_actual: valor,
          umbral: tipo === 'gas' ? umbralMax : `${umbralMin}-${umbralMax}`,
          severidad: severidad
        });
        
        // Marcar como alerta creada con timestamp
        setAlertasCreadas(prev => {
          const nuevo = new Set(prev);
          // Limpiar alertas antiguas del mismo tipo (más de 5 minutos)
          const ahora = Date.now();
          Array.from(nuevo).forEach(key => {
            if (key.startsWith(`${tipo}_fuera_rango`)) {
              const timestamp = parseInt(key.split('_').pop());
              if (ahora - timestamp > 300000) { // 5 minutos
                nuevo.delete(key);
              }
            }
          });
          nuevo.add(alertaKey);
          return nuevo;
        });
        
        // Actualizar estado anterior
        setEstadoAnterior(prev => ({ ...prev, [tipo]: valor }));
        
        console.log(`✅ Alerta creada: ${tipo} fuera de rango (${valor})`);
      } catch (error) {
        console.error(`❌ Error al crear alerta para ${tipo}:`, error);
      }
    } else {
      // Si no está fuera de rango, actualizar estado anterior
      setEstadoAnterior(prev => ({ ...prev, [tipo]: valor }));
    }
  };
  
  // Monitorear sensorData del WebSocket y crear alertas cuando sea necesario
  useEffect(() => {
    // Verificar y crear alertas usando los datos del WebSocket (sensorData)
    if (sensorData.temperature !== null && sensorData.temperature !== undefined) {
      verificarYCrearAlerta(
        'temperatura',
        sensorData.temperature,
        RANGOS.temperatura.min_optimo,
        RANGOS.temperatura.max_optimo,
        RANGOS.temperatura.max_critico
      );
    }
    
    if (sensorData.humidity !== null && sensorData.humidity !== undefined) {
      verificarYCrearAlerta(
        'humedad',
        sensorData.humidity,
        RANGOS.humedad.min_optimo,
        RANGOS.humedad.max_optimo,
        null
      );
    }
    
    if (sensorData.co !== null && sensorData.co !== undefined) {
      verificarYCrearAlerta(
        'gas',
        sensorData.co,
        0,
        RANGOS.gas.max_seguro,
        RANGOS.gas.max_critico
      );
    }
  }, [sensorData.temperature, sensorData.humidity, sensorData.co]);
  
  // Cargar datos cuando se monta el componente
  useEffect(() => {
    cargarCalidadAire();
    cargarDatosSensor();
    
    // Actualizar datos cada 5 segundos
    const interval = setInterval(() => {
      cargarDatosSensor();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected && !lastUpdate) {
        setHasTimedOut(true);
      }
    }, 10000); // 10 segundos de timeout
    
    return () => clearTimeout(timer);
  }, [isConnected, lastUpdate]);
  
  // Si está cargando, mostrar mensaje
  if (!isConnected && !lastUpdate && !hasTimedOut) {
    return <LoadingMessage message="Conectando con sensores..." />;
  }
  
  // Si no hay conexión y no hay datos después del timeout, mostrar datos por defecto
  if (!isConnected && !lastUpdate && hasTimedOut) {
    console.warn('⚠️ No se pudo conectar al WebSocket después de 10 segundos, mostrando datos por defecto');
  }

  return (
    <div className="admin-panel min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 sm:pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#274181] mb-2">
              Monitoreo Ambiental
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <span className="text-red-700 font-medium">Error de conexión: {error}</span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Calidad Ambiental */}
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0DC0E8] to-[#274181] rounded-2xl shadow-lg mt-2 flex items-center justify-center">
                    <FaLeaf className="w-6 h-6 text-white drop-shadow-lg flex items-center justify-center" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#274181]">Calidad Ambiental</h2>
                    <p className="text-sm text-[#274181]/70">Índice general de calidad del aire</p>
                  </div>
                </div>
                <button
                  onClick={cargarCalidadAire}
                  disabled={loadingAirQuality}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Actualizar datos de calidad de aire"
                >
                  <FaSync className={`w-5 h-5 text-[#274181] ${loadingAirQuality ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Loading State */}
                {loadingAirQuality && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#274181]"></div>
                    <p className="mt-2 text-sm text-[#274181]/70">Analizando calidad de aire...</p>
                  </div>
                )}
                
                {/* Error State */}
                {errorAirQuality && !loadingAirQuality && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="text-red-500 mr-2" />
                      <span className="text-red-700 text-sm">{errorAirQuality}</span>
                    </div>
                    <button
                      onClick={cargarCalidadAire}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
                
                {/* Datos del Backend (si están disponibles) */}
                {airQualityFromBackend && !loadingAirQuality && (
                  <>
                    {/* IAQ Score */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#274181] mb-2">{airQualityFromBackend.score}%</div>
                      <div className="text-lg font-semibold text-[#274181] mb-4 capitalize">{airQualityFromBackend.category}</div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                        <div
                          className="h-4 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${airQualityFromBackend.score}%`,
                            background:
                              airQualityFromBackend.score >= 80
                                ? 'linear-gradient(90deg, #0DC0E8, #95CDD1)'
                                : airQualityFromBackend.score >= 60
                                ? 'linear-gradient(90deg, #F6963F, #0DC0E8)'
                                : 'linear-gradient(90deg, #D95766, #F6963F)',
                          }}
                        >
                          <div className="text-right pr-2 text-white text-xs font-bold leading-4">
                            {airQualityFromBackend.score}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="text-[#274181] text-sm font-semibold mb-2">Descripción</h3>
                      <p className="text-[#1E40AF] text-sm">{airQualityFromBackend.description}</p>
                    </div>

                    {/* Recommendation */}
                    <div
                      className={`rounded-xl p-4 border ${
                        airQualityFromBackend.score >= 80
                          ? 'bg-green-50 border-green-200'
                          : airQualityFromBackend.score >= 60
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <h3
                        className={`text-sm font-semibold mb-2 ${
                          airQualityFromBackend.score >= 80
                            ? 'text-green-700'
                            : airQualityFromBackend.score >= 60
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}
                      >
                        Recomendación
                      </h3>
                      <p
                        className={`text-sm ${
                          airQualityFromBackend.score >= 80
                            ? 'text-green-600'
                            : airQualityFromBackend.score >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {airQualityFromBackend.recommendation}
                      </p>
                    </div>
                  </>
                )}
                
                {/* Fallback: usar datos del SensorContext si no hay datos del backend */}
                {!airQualityFromBackend && !loadingAirQuality && !errorAirQuality && (
                  <>
                    {/* IAQ Score */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#274181] mb-2">{airQuality.score}%</div>
                      <div className="text-lg font-semibold text-[#274181] mb-4">{airQuality.category}</div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                        <div
                          className="h-4 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${airQuality.score}%`,
                            background:
                              airQuality.score >= 80
                                ? 'linear-gradient(90deg, #0DC0E8, #95CDD1)'
                                : airQuality.score >= 60
                                ? 'linear-gradient(90deg, #F6963F, #0DC0E8)'
                                : 'linear-gradient(90deg, #D95766, #F6963F)',
                          }}
                        >
                          <div className="text-right pr-2 text-white text-xs font-bold leading-4">
                            {airQuality.score}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="text-[#274181] text-sm font-semibold mb-2">Descripción</h3>
                      <p className="text-[#1E40AF] text-sm">{airQuality.description}</p>
                    </div>

                    {/* Recommendation */}
                    <div
                      className={`rounded-xl p-4 border ${
                        airQuality.score >= 80
                          ? 'bg-green-50 border-green-200'
                          : airQuality.score >= 60
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <h3
                        className={`text-sm font-semibold mb-2 ${
                          airQuality.score >= 80
                            ? 'text-green-700'
                            : airQuality.score >= 60
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}
                      >
                        Recomendación
                      </h3>
                      <p
                        className={`text-sm ${
                          airQuality.score >= 80
                            ? 'text-green-600'
                            : airQuality.score >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {airQuality.recommendation}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sensor Cards */}
            <div className="flex flex-col gap-6 h-full">
              {/* Temperature Card */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#274181] to-[#D95766] rounded-xl mt-2 flex items-center justify-center">
                      <FaThermometerHalf className="w-5 h-5 text-white drop-shadow-lg flex items-center justify-center" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#274181] group-hover:text-[#D95766] transition-colors duration-300">
                        Temperatura
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#274181]">
                      {valoresSensor.temperatura.toFixed(1)}°C
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#274181] to-[#D95766] transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min(Math.max(valoresSensor.temperatura, 0), 50) * 2}%` 
                    }}
                  />
                </div>
              </div>

              {/* Humidity Card */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#95CDD1] to-[#274181] rounded-xl mt-2 flex items-center justify-center">
                      <FaTint className="w-5 h-5 text-white drop-shadow-lg flex items-center justify-center" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#274181]">Humedad</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#274181]">
                      {valoresSensor.humedad.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#95CDD1] to-[#274181] transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min(Math.max(valoresSensor.humedad, 0), 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Gases Tóxicos Card */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#F6963F] to-[#D95766] rounded-xl mt-2 flex items-center justify-center">
                      <FaWind className="w-5 h-5 text-white drop-shadow-lg flex items-center justify-center" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#274181]">Gases Tóxicos</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#274181]">
                      {(valoresSensor.gas / 100).toFixed(1)} ppm
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#F6963F] to-[#D95766] transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min(Math.max(valoresSensor.gas / 100, 0), 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alertas Section */}
          <div className="mt-8">
            <AlertasPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
