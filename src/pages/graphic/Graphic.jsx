// pages/graphic/Graphic.jsx
import { useEffect, useState, useMemo } from "react";
import { getCiudades, getDiaria, exportCsv, getSerie } from "../../api/clima";
import CitySelect from "../../components/cityselect/CitySelect";
import DailyStrip from "../../components/daily/DailyStrip";
import DailyStripPro from "../../components/daily/DailyStripPro";
import DailyMixedChart from "../../components/dailymixed/DailyMixedChart";
import TodayKpis from "../../components/todayKPIs/TodayKpis";
import LoadingPage from "../../components/LoadingPage";
import SnowV3 from "../../components/SnowV3";
import AnimatedGradient from "../../components/AnimatedGradient";
import LoadingOverlay from "../../components/LoadingOverlay";
import "./Graphic.css";

export default function GraficaDiaria() {
  const [loadingCities, setLoadingCities] = useState(true);
  const [cities, setCities] = useState([]);
  const [ciudadId, setCiudadId] = useState(null);

  // Histórico “siempre 1d” (para el resto del UI)
  const [data, setData] = useState([]);

  // Serie flexible para el gráfico
  const [dataGraphic, setDataGraphic] = useState([]);

  const [granularity, setGranularity] = useState("1d");
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const startTime = Date.now();
  const from = "2025-09-04";
  const to = "2025-09-15";

  // Mapeo simple: ciudad -> zona horaria (ajusta si tus IDs cambian)
  const cityTimeZones = {
    1: "Asia/Shanghai", // Shanghai
    2: "Europe/Berlin", // Berlín
    3: "America/Sao_Paulo", // Río de Janeiro
  };
  const timeZone = cityTimeZones[ciudadId] ?? "UTC";

  const StaticSnow = useMemo(
    () => (
      <SnowV3
        className="absolute inset-0 z-[1]"
        density={70}
        speed={1.1}
        color="#fff"
      />
    ),
    []
  );

  // Cargar ciudades
  useEffect(() => {
    (async () => {
      try {
        setLoadingCities(true);
        const rows = await getCiudades();
        const sorted = (rows || []).sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es")
        );
        setCities(sorted);
      } finally {
        const elapsed = Date.now() - startTime;
        const min = 2800;
        const remaining = Math.max(min - elapsed, 0);
        setTimeout(() => setLoadingCities(false), remaining);
      }
    })();
  }, []);



  // Cargar datos (diaria 1d + serie por granularidad)
  useEffect(() => {
    if (cities && !ciudadId) {
      setLoading(false);
      return;
    }

    const currentDataKey = `${ciudadId}-${from}-${to}-${granularity}`;
    const lastDataKey = localStorage.getItem("lastDataKey");
    if (
      currentDataKey === lastDataKey &&
      data.length > 0 &&
      dataGraphic.length > 0
    ) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const respDiaria = await getDiaria({ ciudad_id: ciudadId, from, to }); // siempre 1d
        const respSerie = await getSerie({
          ciudad_id: ciudadId,
          from,
          to,
          granularity,
        });

        setData(respDiaria || []);
        setDataGraphic(respSerie || []);
        localStorage.setItem("lastDataKey", currentDataKey);
        setInitialLoadComplete(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [ciudadId, from, to, granularity, cities]); // <- incluye granularidad

  // “Hoy” para KPIs
  const hoy = useMemo(() => {
    if (!data?.length) return null;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const exact = data.find((d) => (d.fecha ?? "").startsWith(today));
    return exact ?? data[data.length - 1];
  }, [data]);

  const citiesById = useMemo(
    () => Object.fromEntries(cities.map((c) => [c.id, c])),
    [cities]
  );
  const selectedCity = ciudadId != null ? citiesById[ciudadId] : null;

  const selectedCoords = useMemo(() => {
    if (!selectedCity) return null;
    return { lat: selectedCity.latitud, lon: selectedCity.longitud };
  }, [selectedCity]);

  if (cities && loadingCities)
    return <LoadingPage message="Cargando datos del clima..." />;

  return (
    <div className="weather-page">
      {/* {loading && <LoadingPage overlay message="Actualizando información..." />} */}
      {loading && <LoadingOverlay message="Actualizando información..." />}

      {StaticSnow}
      <AnimatedGradient />
      <div className="weather-container">
        {/* Ciudad */}
        <div className="weather-section">
          <div className="section-title">Ciudad</div>
          {loadingCities ? (
            <div className="loading-cies">Cargando ciudades disponibles...</div>
          ) : (
            <CitySelect
              cities={cities}
              value={ciudadId ?? ""}
              onChange={(id) => setCiudadId(id)}
              disabled={loadingCities}
            />
          )}
        </div>

        {!ciudadId ? (
          <div className="mt-6 rounded-xl border border-white/10 p-6 text-center text-white/70">
            Elija una ciudad para ver información.
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="weather-section">
              <div className="section-title">Agregado diario (24 h)</div>
              <TodayKpis d={hoy} />
            </div>

            {/* Extendido */}
            {selectedCoords && (
              <div className="weather-section">
                <div className="section-title">Pronóstico extendido</div>
                <DailyStripPro
                  lat={selectedCoords.lat}
                  lon={selectedCoords.lon}
                  days={7}
                />
              </div>
            )}

            {/* Histórico diario (1d fijo) */}
            <div className="weather-section">
              <div className="section-title">Condiciones Previas</div>
              <DailyStrip data={data} />
            </div>

            {/* Gráfico serie (granularidad seleccionable) */}
            <div className="weather-section">
              <div className="chart-header items-center flex gap-2">
                <div className="section-title">Tendencias y Patrones</div>

                <select
                  className="ml-2 rounded-lg border px-2 py-1 text-sm bg-white/90 text-gray-700"
                  value={granularity}
                  onChange={(e) => {
                    const g = e.target.value;
                    setLoading(true); // ← muestra <LoadingPage/>
                    setDataGraphic([]); // ← evita que quede pintada la serie anterior
                    setGranularity(g); // ← dispara el useEffect con la nueva granularidad
                  }}
                >
                  <option value="30m">30 minutos</option>
                  <option value="1h">1 hora</option>
                  <option value="1d">1 día</option>
                  <option value="1w">1 semana</option>
                  <option value="1mo">1 mes</option>
                </select>

                <button
                  className="export-button-small ml-auto"
                  onClick={() => exportCsv({ ciudad_id: ciudadId, from, to })}
                  title="Exportar datos a CSV"
                >
                  📥 CSV
                </button>
              </div>

              <DailyMixedChart
                data={dataGraphic}
                granularity={granularity}
                timeZone={timeZone}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
