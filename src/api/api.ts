import axios from "axios";
import { AuthContextType } from "../context/AuthContext";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const setupInterceptors = (auth: AuthContextType) => {
  api.interceptors.request.use(
    (config) => {
      if (auth.accessToken) {
        config.headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await auth.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          auth.logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};