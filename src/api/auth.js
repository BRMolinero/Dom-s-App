import { api } from "./http";

export async function loginApi({ username, password }) {
  try {
    const res = await api.post(
      "/auth/login",
      { email: username, password } // El backend espera 'email' pero mantenemos 'username' en el frontend
    );

    const data = res?.data;

    if (!data?.token) {
      const msg =
        data?.mensaje ||
        data?.message ||
        data?.error ||
        (res?.status === 401
          ? "Credenciales incorrectas."
          : "No se pudo iniciar sesión.");
      const err = new Error(msg);
      err.response = { status: res?.status ?? 400, data };
      throw err;
    }

    // Convertir token del backend a accessToken para el frontend
    return { 
      accessToken: data.token,
      usuario: data.usuario,
      mensaje: data.mensaje
    }; 
  } catch (err) {
    // Mejorar el manejo de errores
    if (err.response) {
      // Error con respuesta del servidor
      const errorData = err.response.data || {};
      const errorMsg = errorData.mensaje || errorData.message || errorData.error || err.message;
      const newErr = new Error(errorMsg);
      newErr.response = {
        status: err.response.status,
        data: errorData
      };
      throw newErr;
    } else if (err.request) {
      // Error de conexión (sin respuesta del servidor)
      throw new Error("No se pudo conectar al servidor. Verifique que el backend esté ejecutándose.");
    } else {
      // Otro tipo de error
      throw err;
    }
  }
}

export async function registerApi({ username, email, password }) {
  const { data } = await api.post("/auth/registro", { username, email, password });
  return data;
}

export async function refreshApi() {
  const { data } = await api.post("/auth/refresh", {});
  return data;
}

export async function logoutApi() {
  await api.post("/auth/logout", {});
}

export async function getProfileApi() {
  try {
    const res = await api.get("/auth/perfil");
    return res.data;
  } catch (err) {
    throw err;
  }
}
