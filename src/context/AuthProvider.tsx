import { useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem("user_email"));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));

  const login = (newToken: string, email: string) => {
    if (!newToken || !email) {
      console.error("Invalid token or email provided to login");
      return;
    }
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user_email", email);
    setToken(newToken);
    setUser(email);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
