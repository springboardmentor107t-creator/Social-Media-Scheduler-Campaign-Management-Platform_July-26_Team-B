import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unified error message extraction & auth handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      // Handle 401 Unauthorized (session expired or invalid token)
      if (
        error.response?.status === 401 &&
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    }

    // Extract cleanest user-facing error message
    let message = "An unexpected error occurred. Please try again.";
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        message = error.response.data.detail.map((d) => d.msg || d).join(", ");
      } else {
        message = error.response.data.detail;
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === "ECONNABORTED") {
      message = "Request timed out. Please check your network connection.";
    } else if (!error.response && error.message) {
      message = error.message;
    }

    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default api;