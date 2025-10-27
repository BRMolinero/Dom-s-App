
import axios from "axios";
import { getAuth } from "./authBridge";

// Base URL: apunta al proxy si está VITE_API_URL
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const base = apiBaseUrl.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: base,
  timeout: 10000,
  withCredentials: true, // tu proxy ya expone Access-Control-Allow-Credentials
});

// No agregar Authorization en estos endpoints de auth:
function isAuthUrl(url = "") {
  // añadí "registro" además de "register"
  return /\/auth\/(login|register|registro|refresh|logout)(\/)?$/i.test(url);
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

    if (status !== 401 || config?._retry || isAuthUrl(url)) {
      return Promise.reject(error);
    }

    if (!refreshingPromise) {
      const { accessToken } = getAuth() || {};
      refreshingPromise = api
        .post("/auth/refresh", {}, {
          withCredentials: true,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        })
        .then((r) => {
          const token = r?.data?.accessToken || r?.data?.token;
          const { setAccessToken } = getAuth() || {};
          if (token && setAccessToken) setAccessToken(token);
          return token;
        })
        .finally(() => { refreshingPromise = null; });
    }

    const newAccess = await refreshingPromise;
    if (!newAccess) return Promise.reject(error);

    config._retry = true;
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${newAccess}`;
    return api(config);
  }
);
