import { useLayoutEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
/* import logo from "../../assets/logo1.png"; */
import {
  FaUser,
  FaLock,
  FaRobot,
} from "react-icons/fa";
import "./LoginPage.css";
import RobotBackground from "../../components/RobotBackground";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  // refs para animaciones
  const cardRef = useRef(null);
  const inputsRef = useRef([]);
  const btnRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "back",
        immediateRender: false,
        onComplete: () =>
          gsap.set(cardRef.current, { clearProps: "transform" }),
      });
      gsap.from(inputsRef.current, {
        opacity: 0,
        x: -50,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
        immediateRender: false,
      });

      if (btnRef.current) {
        gsap.from(btnRef.current, {
          opacity: 0,
          scale: 0.5,
          duration: 0.5,
          delay: 1,
          ease: "elastic.out(1, 0.5)",
          immediateRender: false,
          onComplete: () =>
            gsap.set(btnRef.current, { clearProps: "transform" }),
        });
      }
    });

    // Limpia correctamente al re-montar en StrictMode
    return () => ctx.revert();
  }, []);

  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (error) setError(null); // limpia error al tipear
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      console.log("📋 Enviando credenciales...", { email: form.username });
      await login(form);
      console.log("✅ Login exitoso, redirigiendo...");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("❌ Login error:", err); 
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.mensaje || 
                     err?.response?.data?.message || 
                     err?.response?.data?.error ||
                     err?.message;
      
      let msg;
      if (status === 401 || status === 400) {
        msg = "Credenciales incorrectas. Revisá email y contraseña.";
      } else if (status >= 500) {
        msg = "Error del servidor. Intentá nuevamente en unos momentos.";
      } else if (status === 0 || !err.response) {
        msg = "No se pudo conectar al servidor. Verificá que el backend esté ejecutándose.";
      } else {
        msg = apiMsg || "No pudimos iniciar sesión. Intentá de nuevo.";
      }
      
      setError(msg);
    } finally {
      setLoading(false); 
    }
  };

  return (
        <div className="login-page min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-[#274181] via-[#1a2d5a] to-[#0DC0E8]">
      {/* Patrón de fondo profesional */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 30px 30px, rgba(255,255,255,0.1) 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Elementos decorativos sutiles */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-[#95CDD1] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#0DC0E8] rounded-full opacity-15 blur-3xl"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-[#F5F2F2] rounded-full opacity-10 blur-2xl"></div>
      
      <div
        ref={cardRef}
        className="domus-login-container z-[50] rounded-2xl p-10 shadow-2xl w-full max-w-md transform transition-transform duration-300 bg-white border-4 border-[#274181] backdrop-blur-sm"
      >
        <div className="logo-container mb-12">
          <div className="flex items-center justify-center">
            <img 
              src="/logo domus robotOK.png" 
              alt="Domüs Logo" 
              className="h-16 w-auto drop-shadow-lg"
            />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight text-[#1a2d5a] relative">
          Iniciar Sesión
          <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#F6963F] to-[#D95766] rounded-full"></div>
        </h2>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {/* Email */}
          <div className="relative" ref={(el) => (inputsRef.current[0] = el)}>
            <label htmlFor="username" className="block text-white font-bold text-sm mb-3">
              
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <FaUser className="text-[#274181] text-lg" />
              </div>
              <input
                type="email"
                id="username"
                value={form.username}
                onChange={onChange("username")}
                required
                className="w-full pl-14 pr-4 py-4 bg-white border-3 border-[#274181] rounded-xl text-[#274181] placeholder-[#274181]/80 outline-none text-base focus:border-[#F6963F] focus:bg-gray-50 focus:shadow-lg transition-all duration-200"
                placeholder="Email"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative" ref={(el) => (inputsRef.current[1] = el)}>
            <label htmlFor="password" className="block text-white font-bold text-sm mb-3">
            
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <FaLock className="text-[#274181] text-lg" />
              </div>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={onChange("password")}
                required
                className="w-full pl-14 pr-4 py-4 bg-white border-3 border-[#274181] rounded-xl text-[#274181] placeholder-[#274181]/80 outline-none text-base focus:border-[#F6963F] focus:bg-gray-50 focus:shadow-lg transition-all duration-200"
                placeholder="Contraseña"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4" role="alert" aria-live="polite">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <button
            ref={btnRef}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0DC0E8] to-[#274181] text-white font-bold py-4 px-6 rounded-xl text-lg tracking-wide hover:from-[#F6963F]/90 hover:to-[#D95766]/90 focus:from-[#F6963F]/90 focus:to-[#D95766]/90 disabled:from-[#F6963F]/50 disabled:to-[#D95766]/50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:scale-[1.02]"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white flex items-center justify-center" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                 {/*  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg> */}
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-10 pt-8 border-t-4 border-[#274181]">
          <p className="text-white text-center text-base font-medium">
            ¿No tiene una cuenta?{" "}
            <a href="/register" className="text-[#0f1a3a] font-bold hover:text-[#274181] transition-colors underline decoration-2 underline-offset-2">
              Crear cuenta
            </a>
          </p>
        </div>
      </div>
      <RobotBackground />
    </div>
  );
}
