import api from "./api";

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!getToken();
}

export async function register(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  const token = response.data.token || response.data.access_token;
  if (token) {
    setToken(token);
  }
  return response.data;
}

export function logout() {
  clearToken();
}