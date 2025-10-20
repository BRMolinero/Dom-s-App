import React, { useState, useEffect } from 'react';
import { 
  FaTint,
  FaWind,
  FaExclamationTriangle,
  FaThermometerHalf,
  FaLeaf
} from 'react-icons/fa';

const AdminPanel = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    co: 0, // Monóxido de carbono en ppm
  });
  const [loading, setLoading] = useState(true);

  // Función para calcular calidad del ambiente
  const calculateAirQuality = () => {
    const { temperature, humidity, co } = sensorData;
    
    // Factores de calidad (0-100)
    let tempScore = 100;
    let humidityScore = 100;
    let coScore = 100;
    
    // Temperatura: óptima entre 18-25°C
    if (temperature < 18 || temperature > 25) {
      tempScore = Math.max(0, 100 - Math.abs(temperature - 21.5) * 10);
    }
    
    // Humedad: óptima entre 40-60%
    if (humidity < 40 || humidity > 60) {
      humidityScore = Math.max(0, 100 - Math.abs(humidity - 50) * 2);
    }
    
    // CO: óptimo < 20 ppm
    if (co > 20) {
      coScore = Math.max(0, 100 - (co - 20) * 2);
    }
    
    // Promedio ponderado
    const airQuality = Math.round((tempScore * 0.3 + humidityScore * 0.3 + coScore * 0.4));
    return Math.max(0, Math.min(100, airQuality));
  };

  // Función para obtener datos del backend
  const fetchSensorData = async () => {
    try {
      console.log('Obteniendo datos de sensores del backend...');
      
      // TODO: Reemplazar con llamada real al backend
      // const response = await api.get('/sensors/environmental');
      // const data = response.data;
      
      // Datos estáticos para mostrar
      const mockData = {
        temperature: 23.5,
        humidity: 48.7,
        co: 15.2
      };
      
      setSensorData(mockData);
      setLoading(false);
      
    } catch (error) {
      console.error('Error obteniendo datos de sensores:', error);
      setLoading(false);
    }
  };

  // Cargar datos al usarel componente
  useEffect(() => {
    fetchSensorData();
    
    // Opcional: refrescar datos cada 30 segundos
    const interval = setInterval(fetchSensorData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para calcular el porcentaje de la barra de temperatura
  const getTemperaturePercentage = () => {
    // Rango de temperatura: 0-40°C = 0-100%
    return Math.min(Math.max((sensorData.temperature / 40) * 100, 0), 100);
  };

  // Función para calcular el porcentaje de la barra de humedad
  const getHumidityPercentage = () => {
    // La humedad ya está en porcentaje (0-100%)
    return Math.min(Math.max(sensorData.humidity, 0), 100);
  };

  // Función para calcular el porcentaje de la barra de CO
  const getCOPercentage = () => {
    // Rango de CO: 0-100 ppm = 0-100%
    return Math.min(Math.max(sensorData.co, 0), 100);
  };

  if (loading) {
    return (
      <div className="admin-panel min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#274181] mx-auto mb-4"></div>
          <p className="text-[#274181] text-lg font-semibold">Cargando datos ambientales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#274181] rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-[#0DC0E8] rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-[#F6963F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-[#D95766] rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-[#274181] mb-4 bg-gradient-to-r from-[#274181] to-[#0DC0E8] bg-clip-text text-transparent">
            Monitoreo Ambiental
          </h1>
        </div>

        {/* Sensores Ambientales */}
        <div className="mb-12">
          
          {/* Calidad del Ambiente - Primera fila */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              {/* Calidad del Ambiente */}
              <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 transform overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#95CDD1]/5 to-[#0DC0E8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#95CDD1] to-[#0DC0E8] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-[#95CDD1]/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <FaLeaf className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    calculateAirQuality() < 50 
                      ? 'text-red-600 bg-red-100' 
                      : calculateAirQuality() < 80
                      ? 'text-yellow-600 bg-yellow-100'
                      : 'text-green-600 bg-green-100'
                  }`}>
                    {calculateAirQuality()}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#274181] mb-3 group-hover:text-[#95CDD1] transition-colors duration-300">Calidad del Ambiente</h3>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-700 group-hover:shadow-lg ${
                      calculateAirQuality() < 50 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : calculateAirQuality() < 80
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${calculateAirQuality()}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Basado en temperatura, humedad y CO
                </p>
                {calculateAirQuality() < 50 && (
                  <div className="mt-3 flex items-center gap-2 text-red-600">
                    <FaExclamationTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">CALIDAD BAJA</span>
                  </div>
                )}
                {calculateAirQuality() >= 50 && calculateAirQuality() < 80 && (
                  <div className="mt-3 flex items-center gap-2 text-yellow-600">
                    <FaExclamationTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">CALIDAD MEDIA</span>
                  </div>
                )}
                {calculateAirQuality() >= 80 && (
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <FaLeaf className="w-4 h-4" />
                    <span className="text-sm font-semibold">CALIDAD EXCELENTE</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sensores Individuales - Segunda fila */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sensor de Temperatura */}
            <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 transform overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D95766]/5 to-[#F6963F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D95766] to-[#F6963F] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-[#D95766]/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FaThermometerHalf className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <span className="text-sm font-semibold text-[#D95766] bg-[#D95766]/10 px-3 py-1 rounded-full">
                  {sensorData.temperature.toFixed(1)}°C
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#274181] mb-3 group-hover:text-[#D95766] transition-colors duration-300">Temperatura</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className="bg-gradient-to-r from-[#D95766] to-[#F6963F] h-3 rounded-full transition-all duration-700 group-hover:shadow-lg"
                  style={{ width: `${getTemperaturePercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Temperatura ambiental
              </p>
            </div>

            {/* Sensor de Humedad */}
            <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 transform overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0DC0E8]/5 to-[#95CDD1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0DC0E8] to-[#95CDD1] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-[#0DC0E8]/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FaTint className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <span className="text-sm font-semibold text-[#0DC0E8] bg-[#0DC0E8]/10 px-3 py-1 rounded-full">
                  {sensorData.humidity.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#274181] mb-3 group-hover:text-[#0DC0E8] transition-colors duration-300">Humedad</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className="bg-gradient-to-r from-[#0DC0E8] to-[#95CDD1] h-3 rounded-full transition-all duration-700 group-hover:shadow-lg"
                  style={{ width: `${getHumidityPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Nivel de humedad ambiental
              </p>
            </div>

            {/* Sensor de Monóxido de Carbono */}
            <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 transform overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D95766]/5 to-[#F6963F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D95766] to-[#F6963F] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-[#D95766]/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <FaWind className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  sensorData.co > 50 
                    ? 'text-red-600 bg-red-100' 
                    : 'text-[#D95766] bg-[#D95766]/10'
                }`}>
                  {sensorData.co.toFixed(1)} ppm
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#274181] mb-3 group-hover:text-[#D95766] transition-colors duration-300">CO</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 group-hover:shadow-lg ${
                    sensorData.co > 50 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : 'bg-gradient-to-r from-[#D95766] to-[#F6963F]'
                  }`}
                  style={{ width: `${getCOPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Monóxido de carbono
              </p>
              {sensorData.co > 50 && (
                <div className="mt-3 flex items-center gap-2 text-red-600">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">ALERTA</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
