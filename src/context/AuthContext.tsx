/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { User } from "../types/User";
import { api } from "../api/api";

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ accessToken: string; cargo: any }>;
  loginWithGoogle: (googleJwt: string) => Promise<AxiosResponse<any>>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Erro ao parsear user do localStorage:", error);
      return null;
    }
  });

  const isAuthenticated = !!accessToken && !!user;

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post(
        "/login",
        { email, password },
        { withCredentials: true }
      );

      const { accessToken, user } = res.data;

      setAccessToken(accessToken);
      setUser(user);

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      return { accessToken, cargo: user.cargo };

      navigate("/dashboard");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        throw new Error(error.response.data.message || "Credenciais inválidas");
      }
      throw new Error("Erro ao realizar login");
    }
  };

  const loginWithGoogle = async (
    googleJwt: string
  ): Promise<AxiosResponse<any>> => {
    try {
      const res = await api.post(
        "/auth/google/token",
        { token: googleJwt },
        { withCredentials: true }
      );

      const { accessToken: token, user: googleUser } = res.data;

      setAccessToken(token);
      setUser(googleUser);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(googleUser));

      setTimeout(() => {
        navigate("/dashboard");
      }, 300);

      return res; 
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      throw new Error("Erro ao autenticar com Google");
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/");
  };

  const refreshToken = async () => {
    try {
      const res = await axios.post(
        "/api/refresh",
        {},
        { withCredentials: true }
      );
      setAccessToken(res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
    } catch (error) {
      logout();
      console.log("Erro ao renovar token:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setAccessToken(token);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao parsear user do localStorage:", error);
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated,
        login,
        loginWithGoogle,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { AuthContextType };
