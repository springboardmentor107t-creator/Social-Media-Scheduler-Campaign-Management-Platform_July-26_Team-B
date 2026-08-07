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
  const response = await api.post("/api/v1/auth/register", {
    email: data.email,
    full_name: data.name,
    role: data.role,
    password: data.password,
  });
  return response.data;
}

export async function login(email, password) {
  const response = await api.post("/api/v1/auth/login/json", {
    email,
    password,
  });

  const token = response.data.access_token || response.data.token;
  if (token) {
    setToken(token);
  }
  return response.data;
}

export function logout() {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}