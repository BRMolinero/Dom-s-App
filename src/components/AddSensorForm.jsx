import { useState } from 'react';
import { createSensor, createSensorBatch, SENSOR_TYPES, SENSOR_UNITS } from '../api/sensors';

export default function AddSensorForm() {
  const [formData, setFormData] = useState({
    dispositivo_id: '',
    tipo_sensor: '',
    valor: '',
    unidad: '',
    metadata: ''
  });
  const [batchMode, setBatchMode] = useState(false);
  const [batchData, setBatchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (batchMode) {
        // Modo batch
        if (batchData.length === 0) {
          throw new Error('Debe agregar al menos un dato al batch');
        }

        const batchPayload = {
          dispositivo_id: parseInt(formData.dispositivo_id),
          datos: batchData.map(item => ({
            tipo_sensor: item.tipo_sensor,
            valor: parseFloat(item.valor),
            unidad: item.unidad,
            metadata: item.metadata ? JSON.parse(item.metadata) : {}
          }))
        };

        const result = await createSensorBatch(batchPayload);
        setMessage(`✅ ${result.cantidad} registros guardados correctamente`);
        setBatchData([]);
      } else {
        // Modo individual
        const sensorPayload = {
          dispositivo_id: parseInt(formData.dispositivo_id),
          tipo_sensor: formData.tipo_sensor,
          valor: parseFloat(formData.valor),
          unidad: formData.unidad,
          metadata: formData.metadata ? JSON.parse(formData.metadata) : {}
        };

        const result = await createSensor(sensorPayload);
        setMessage(result.mensaje);
      }

      // Limpiar formulario
      setFormData({
        dispositivo_id: '',
        tipo_sensor: '',
        valor: '',
        unidad: '',
        metadata: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al guardar datos');
    } finally {
      setLoading(false);
    }
  };

  const addToBatch = () => {
    if (!formData.tipo_sensor || !formData.valor || !formData.unidad) {
      setError('Debe completar tipo_sensor, valor y unidad');
      return;
    }

    const newItem = {
      tipo_sensor: formData.tipo_sensor,
      valor: formData.valor,
      unidad: formData.unidad,
      metadata: formData.metadata || '{}'
    };

    setBatchData(prev => [...prev, newItem]);
    setFormData(prev => ({
      ...prev,
      tipo_sensor: '',
      valor: '',
      unidad: '',
      metadata: ''
    }));
    setError(null);
  };

  const removeFromBatch = (index) => {
    setBatchData(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#274181]">Agregar Datos de Sensor</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-[#274181]">Modo Batch:</label>
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(e) => setBatchMode(e.target.checked)}
            className="w-4 h-4 text-[#0DC0E8] border-[#274181] rounded focus:ring-[#0DC0E8]"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dispositivo ID */}
        <div>
          <label className="block text-sm font-medium text-[#274181] mb-2">
            ID Dispositivo *
          </label>
          <input
            type="number"
            value={formData.dispositivo_id}
            onChange={(e) => handleInputChange('dispositivo_id', e.target.value)}
            required
            className="w-full p-3 border border-[#274181] rounded-lg focus:border-[#F6963F] focus:outline-none"
            placeholder="Ej: 1"
          />
        </div>

        {/* Tipo de Sensor */}
        <div>
          <label className="block text-sm font-medium text-[#274181] mb-2">
            Tipo de Sensor *
          </label>
          <select
            value={formData.tipo_sensor}
            onChange={(e) => handleInputChange('tipo_sensor', e.target.value)}
            required
            className="w-full p-3 border border-[#274181] rounded-lg focus:border-[#F6963F] focus:outline-none"
          >
            <option value="">Seleccionar tipo</option>
            {Object.entries(SENSOR_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-[#274181] mb-2">
            Valor *
          </label>
          <input
            type="number"
            step="any"
            value={formData.valor}
            onChange={(e) => handleInputChange('valor', e.target.value)}
            required
            className="w-full p-3 border border-[#274181] rounded-lg focus:border-[#F6963F] focus:outline-none"
            placeholder="Ej: 25.5"
          />
        </div>

        {/* Unidad */}
        <div>
          <label className="block text-sm font-medium text-[#274181] mb-2">
            Unidad *
          </label>
          <select
            value={formData.unidad}
            onChange={(e) => handleInputChange('unidad', e.target.value)}
            required
            className="w-full p-3 border border-[#274181] rounded-lg focus:border-[#F6963F] focus:outline-none"
          >
            <option value="">Seleccionar unidad</option>
            {Object.entries(SENSOR_UNITS).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Metadatos */}
        <div>
          <label className="block text-sm font-medium text-[#274181] mb-2">
            Metadatos (JSON opcional)
          </label>
          <textarea
            value={formData.metadata}
            onChange={(e) => handleInputChange('metadata', e.target.value)}
            className="w-full p-3 border border-[#274181] rounded-lg focus:border-[#F6963F] focus:outline-none"
            placeholder='{"ubicacion": "sala", "calibrado": true}'
            rows={3}
          />
        </div>

        {/* Botones */}
        <div className="flex space-x-4">
          {batchMode && (
            <button
              type="button"
              onClick={addToBatch}
              className="px-6 py-3 bg-gradient-to-r from-[#F6963F] to-[#D95766] text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Agregar al Batch
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#0DC0E8] to-[#274181] text-white rounded-lg hover:from-[#F6963F] hover:to-[#D95766] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : batchMode ? 'Guardar Batch' : 'Guardar'}
          </button>
        </div>
      </form>

      {/* Lista del Batch */}
      {batchMode && batchData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#274181] mb-3">
            Datos en Batch ({batchData.length})
          </h3>
          <div className="space-y-2">
            {batchData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div>
                  <span className="font-medium">{item.tipo_sensor}</span>
                  <span className="ml-2 text-gray-600">
                    {item.valor} {item.unidad}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromBatch(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensajes */}
      {message && (
        <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="text-green-700 font-medium">{message}</div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="text-red-700 font-medium">Error: {error}</div>
        </div>
      )}
    </div>
  );
}

