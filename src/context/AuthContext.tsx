/* eslint-disable react-refresh/only-export-components */
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User } from "../types/User";

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
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
      const res = await axios.post(
        "/api/login",
        { email, password },
        { withCredentials: true }
      );

      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao realizar login:", error);
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
      const res = await axios.post("/api/refresh", {}, { withCredentials: true });
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
    console.log(storedUser, 'storedUser');
  
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
    <AuthContext.Provider value={{ accessToken, user, isAuthenticated, login, logout, refreshToken }}>
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
