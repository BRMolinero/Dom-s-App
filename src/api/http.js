import axios from "axios";
import { getAuth } from "./authBridge";

const base = (import.meta.env.VITE_API_CLIMA || "").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${base}/api/v1`,
  timeout: 10000,
  withCredentials: true,
});

// Utilidad: detectar si la URL es un endpoint de auth
function isAuthUrl(url = "") {
  return /\/auth\/(login|register|refresh|logout)(\/)?$/i.test(url);
}

// ---------- Interceptors ----------
api.interceptors.request.use((config) => {
  const { accessToken } = getAuth() || {};
  const url = config?.url || "";
  if (accessToken && !isAuthUrl(url)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshingPromise = null;


api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error || {};
    const status = response?.status;
    const url = config?.url || "";

    // Si no es 401, ya se reintentó, o es /auth/*, no hacemos refresh.
    if (status !== 401 || config?._retry || isAuthUrl(url)) {
      return Promise.reject(error);
    }

    // Single-flight: una sola promesa de refresh compartida
    if (!refreshingPromise) {
      refreshingPromise = api
        .post("/auth/refresh", {}, { withCredentials: true })
        .then((r) => {
          const token = r?.data?.accessToken;
          const { setAccessToken } = getAuth() || {};
          if (token && setAccessToken) setAccessToken(token);
          return token;
        })
        .catch((e) => {
          // Si el refresh falla, propagamos el 401 original
          throw e;
        })
        .finally(() => {
          refreshingPromise = null;
        });
    }

    // Esperamos el nuevo token y reintentamos la original
    const newAccess = await refreshingPromise;
    if (!newAccess) {
      // no hay token nuevo -> rechazamos
      return Promise.reject(error);
    }

    config._retry = true;
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${newAccess}`;
    return api(config);
  }
);
