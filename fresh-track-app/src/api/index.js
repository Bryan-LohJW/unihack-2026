import axios from "axios";

export const apiAxios = axios.create({
  baseURL: `${import.meta.env.SERVER_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});