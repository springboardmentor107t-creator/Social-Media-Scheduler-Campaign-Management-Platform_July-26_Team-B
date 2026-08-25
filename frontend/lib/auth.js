import api from "./api";

export function setToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function setUser(user) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

export function clearUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export async function register(data) {
  const response = await api.post("/api/v1/auth/register", {
    email: data.email,
    username: data.name,
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
    if (response.data.user) {
      setUser(response.data.user);
    }
  }
  return response.data;
}

export function logout() {
  clearToken();
  clearUser();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}