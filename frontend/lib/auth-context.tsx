"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, setToken, type CurrentUser, type LoginResponse } from "./api";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  patientLogin: (phoneNumber: string, password: string) => Promise<void>;
  patientSignup: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get<CurrentUser>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(res.access_token);
    setUser(res.user);
    router.push(res.user.role === "patient" ? "/dashboard/my-records" : "/dashboard");
  }

  async function patientLogin(phoneNumber: string, password: string) {
    const res = await api.post<LoginResponse>("/auth/patient/login", { phone_number: phoneNumber, password });
    setToken(res.access_token);
    setUser(res.user);
    router.push("/dashboard/my-records");
  }

  async function patientSignup(phoneNumber: string, password: string) {
    const res = await api.post<LoginResponse>("/auth/patient/signup", { phone_number: phoneNumber, password });
    setToken(res.access_token);
    setUser(res.user);
    router.push("/dashboard/my-records");
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, patientLogin, patientSignup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ROLE_LABELS: Record<string, string> = {
  doctor: "Doctor",
  hospital_admin: "Hospital Administrator",
  researcher: "Healthcare Researcher",
  system_admin: "System Administrator",
  patient: "Patient",
};
