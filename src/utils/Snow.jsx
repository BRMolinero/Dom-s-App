// src/utils/ParticleBackground.jsx
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticleBackground({
  density = 80,         // cantidad de partículas
  speed = 1.2,          // velocidad de movimiento
  color = "#ffffff",    // color de las partículas
  className = "",       // clases CSS adicionales
  direction = "bottom", // dirección del movimiento
  shape = "circle",     // forma de las partículas
}) {
  const init = async (engine) => { await loadFull(engine); };

  return (
    <Particles
      id="particle-background"
      init={init}
      className={"pointer-events-none " + className}
      options={{
        fullScreen: { enable: false },
        background: { color: "transparent" },
        detectRetina: true,
        fpsLimit: 60,
        particles: {
          number: { value: density, density: { enable: true, area: 800 } },
          color: { value: color },
          shape: { type: shape },
          opacity: { value: { min: 0.2, max: 0.7 } },
          size: { value: { min: 1, max: 3 } },
          move: {
            enable: true,
            direction: direction,
            speed,
            straight: false,
            outModes: { default: "out" },
            drift: 0,
            gravity: { enable: false },
          },
        },
      }}
    />
  );
}
