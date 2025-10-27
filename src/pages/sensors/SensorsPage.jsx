import { useState } from 'react';
import SensorsPanel from '../components/SensorsPanel';
import AddSensorForm from '../components/AddSensorForm';

export default function SensorsPage() {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#274181] via-[#1a2d5a] to-[#0DC0E8] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Panel de Sensores</h1>
          <p className="text-white/80">Gestiona y visualiza los datos de tus sensores IoT</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'view'
                  ? 'bg-white text-[#274181] shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Ver Sensores
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'add'
                  ? 'bg-white text-[#274181] shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Agregar Datos
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'view' && <SensorsPanel />}
          {activeTab === 'add' && <AddSensorForm />}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold mb-2">Estadísticas en Tiempo Real</h3>
            <p className="text-white/80 text-sm">
              Visualiza estadísticas detalladas de tus dispositivos y sensores
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="text-3xl mb-2">🔧</div>
            <h3 className="text-lg font-semibold mb-2">Filtros Avanzados</h3>
            <p className="text-white/80 text-sm">
              Filtra datos por tipo de sensor, dispositivo y período de tiempo
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Carga en Lote</h3>
            <p className="text-white/80 text-sm">
              Agrega múltiples registros de sensores de una sola vez
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

