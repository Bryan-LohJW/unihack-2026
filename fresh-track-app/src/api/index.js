import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_URL ?? "http://localhost:5001";

export const apiAxios = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});