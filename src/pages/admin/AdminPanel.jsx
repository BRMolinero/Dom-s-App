import React from 'react';
import {
  FaTint,
  FaWind,
  FaExclamationTriangle,
  FaThermometerHalf,
  FaLeaf
} from 'react-icons/fa';
import LoadingMessage from '../../components/LoadingMessage';
import { useSensorData } from '../../context/SensorContext';

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
      <div className="relative z-10 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#274181] mb-2">
              Monitoreo Ambiental
            </h1>
            {/* <p className="text-lg text-[#274181]/80">Sensores en tiempo real</p> */}

            {/* WebSocket Status */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-[#274181]/70">
                {isConnected ? 'Conectado en tiempo real' : 'Desconectado'}
              </span>
              {lastUpdate && (
                <span className="text-xs text-[#274181]/60">
                  • Última actualización: {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calidad Ambiental */}
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0DC0E8] to-[#274181] rounded-2xl flex items-center justify-center shadow-lg">
                    <FaLeaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#274181]">Calidad Ambiental</h2>
                    <p className="text-sm text-[#274181]/70">Índice general de calidad del aire</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
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
              </div>
            </div>

            {/* Sensor Cards */}
            <div className="space-y-6">
              {/* Temperature Card */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#D95766] to-[#F6963F] rounded-xl flex items-center justify-center">
                      <FaThermometerHalf className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#274181] group-hover:text-[#D95766] transition-colors duration-300">
                        Temperatura
                      </h3>
                      <p className="text-sm text-[#274181]/70">Rango óptimo: 18-25°C</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#274181]">{sensorData.temperature.toFixed(1)}°C</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#D95766] to-[#F6963F] transition-all duration-1000 ease-out"
                    style={{ width: `${getTemperaturePercentage() * 2}%` }}
                  />
                </div>

                <p className="text-xs text-[#274181]/60">
                  La temperatura ambiente afecta el confort y la eficiencia energética.
                </p>
              </div>

              {/* Humidity Card */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#95CDD1] to-[#274181] rounded-xl flex items-center justify-center">
                      <FaTint className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#274181]">Humedad</h3>
                      <p className="text-sm text-[#274181]/70">Rango óptimo: 40-60%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#274181]">{sensorData.humidity.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#95CDD1] to-[#274181] transition-all duration-1000 ease-out"
                    style={{ width: `${getHumidityPercentage()}%` }}
                  />
                </div>

                <p className="text-xs text-[#274181]/60">
                  La humedad relativa influye en la calidad del aire y el confort térmico.
                </p>
              </div>

              {/* CO Card */}
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#F6963F] to-[#D95766] rounded-xl flex items-center justify-center">
                      <FaWind className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#274181]">Monóxido de Carbono</h3>
                      <p className="text-sm text-[#274181]/70">Rango seguro: 0-9 ppm</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#274181]">{sensorData.co.toFixed(1)} ppm</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#F6963F] to-[#D95766] transition-all duration-1000 ease-out"
                    style={{ width: `${getCOPercentage()}%` }}
                  />
                </div>

                <p className="text-xs text-[#274181]/60">
                  El CO es un gas tóxico que puede causar problemas de salud graves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
