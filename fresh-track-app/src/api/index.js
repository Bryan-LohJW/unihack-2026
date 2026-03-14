import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_URL ?? "/api";

export const apiAxios = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTORS ---

// Intercept Responses
apiAxios.interceptors.response.use(
  (response) => {
    // Automatically extract the 'data' object so you don't have to do 'response.data' everywhere
    return response.data;
  },
  (error) => {
    // Centralized error handling
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // e.g., window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      console.error("Server is down.");
    }

    return Promise.reject(error);
  },
);
