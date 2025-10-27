
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginApi, logoutApi, refreshApi } from "../api/auth";
import { bindAuth } from "../api/authBridge";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1) Inicializamos desde localStorage (fallback para F5)
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [bootstrapped, setBootstrapped] = useState(false);

  const isAuthenticated = !!accessToken;

  // 2) Login: con fallback a credenciales hardcodeadas para desarrollo
  const login = useCallback(async ({ username, password }) => {
    try {
      console.log("🔐 Iniciando login con el backend...");
      const data = await loginApi({ username, password });
      
      if (!data.accessToken) {
        throw new Error("No se recibió token de acceso del servidor");
      }
      
      console.log("✅ Login exitoso, guardando token y usuario");
      setAccessToken(data.accessToken);
      setUser(data.usuario ?? null);
      localStorage.setItem("accessToken", data.accessToken);
      if (data.usuario) localStorage.setItem("user", JSON.stringify(data.usuario));
      return data;
    } catch (error) {
      console.error("❌ Error en login:", error);
      // Fallback: credenciales hardcodeadas para desarrollo
      /* const hardcodedCredentials = {
        username: "domus_admin",
        password: "domus123"
      }; */
      
      /* if (username === hardcodedCredentials.username && password === hardcodedCredentials.password) {
        const mockData = {
          accessToken: "mock_token_" + Date.now(),
          user: {
            id: 1,
            username: "",
            role: "admin",
            name: "Administrador Domüs"
          }
        };
        
        setAccessToken(mockData.accessToken);
        setUser(mockData.user);
        localStorage.setItem("accessToken", mockData.accessToken);
        localStorage.setItem("user", JSON.stringify(mockData.user));
        
        console.log("✅ Login exitoso con credenciales de desarrollo");
        return mockData;
      } */
      
      // Propagar el error con toda la información necesaria
      throw error;
    }
  }, []);

  // 3) Logout: limpia todo (funciona con o sin backend)
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      // Si falla el logout del backend, continuar con la limpieza local
      console.log("⚠️ Logout del backend falló, limpiando sesión local");
    } finally {
      // Limpiar estado del contexto
      setAccessToken(null);
      setUser(null);
      
      // Limpiar todos los datos de sesión del localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token");
      
      // Limpiar cualquier otro dato de sesión que pueda existir
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('token') || key.includes('session')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, []);

  // 4) Bootstrap de sesión al montar:
  //    - Intentar refresh SIEMPRE (por si hay cookie)
  //    - PERO si falla NO limpiar localStorage para evitar logout al F5
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Mantener el token de LS como fallback visible
        const tokenLS = localStorage.getItem("accessToken");
        if (tokenLS && mounted) setAccessToken(tokenLS);

        // Intento de refresh solo si hay token en LS
        if (tokenLS) {
          try {
            const data = await refreshApi(); // withCredentials: true (cookie)
            if (!mounted) return;

            if (data?.accessToken) {
              setAccessToken(data.accessToken);
              localStorage.setItem("accessToken", data.accessToken);
            }
          } catch (refreshError) {
            // El refresh falló silenciosamente, pero seguimos con el token de LS si existe
            console.log("ℹ️ No hay sesión activa, continuando con token local si existe");
          }
        }

        // Si quisieras, podrías cargar /me aquí cuando no haya user en LS
        // try { const me = await api.get('/auth/me'); setUser(me.data); localStorage.setItem('user', JSON.stringify(me.data)); } catch {}
      } catch (error) {
        // Importante: NO limpiar localStorage si el refresh falla
        // Dejar que el app siga con el token de LS (si existía)
        console.error("Error durante bootstrap:", error);
      } finally {
        if (mounted) setBootstrapped(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 5) Bridge para que tu http.js/axios lea/actualice el accessToken actual
  useEffect(() => {
    bindAuth({ accessToken, setAccessToken });
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated,
        login,
        logout,
        setAccessToken,
        setUser,
        bootstrapped,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
