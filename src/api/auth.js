import { api } from "./http";

export async function loginApi({ username, password }) {
  try {
    const res = await api.post(
      "/auth/login",
      { username, password },
      { withCredentials: true }
    );

    const data = res?.data;

    if (!data?.accessToken) {
      const msg =
        data?.message ||
        data?.error ||
        (res?.status === 401
          ? "Credenciales incorrectas."
          : "No se pudo iniciar sesión.");
      const err = new Error(msg);
      err.response = { status: res?.status ?? 400, data };
      throw err;
    }

    return data; 
  } catch (err) {
 
    throw err;
  }
}

export async function registerApi({ username, password }) {
  const { data } = await api.post("/auth/register", { username, password }, { withCredentials: true });
  return data;
}

export async function refreshApi() {
  const { data } = await api.post("/auth/refresh", {}, { withCredentials: true });
  return data;
}

export async function logoutApi() {
  await api.post("/auth/logout", {}, { withCredentials: true });
}
