import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService, getToken, removeToken, User } from "../services/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing token on app launch
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        const user = await apiService.getCurrentUser();
        setState({ user, isLoading: false, isAuthenticated: true });
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      // Token expired or invalid
      await removeToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const login = async (username: string, password: string) => {
    const result = await apiService.login(username, password);
    setState({ user: result.user, isLoading: false, isAuthenticated: true });
  };

  const register = async (username: string, password: string, email?: string) => {
    const result = await apiService.register(username, password, email);
    setState({ user: result.user, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    await apiService.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
