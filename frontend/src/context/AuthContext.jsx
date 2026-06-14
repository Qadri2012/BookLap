// ✅ NEW: AuthContext modern production-ready

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import apiClient, {
  setUnauthorizedHandler,
  setToken,
  removeToken,
  refreshAuth,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ✅ NEW
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  const logout = useCallback((redirect = true, redirectTo = "/login/user") => {
    removeToken();
    localStorage.removeItem("redirectAfterAuth");
    setUser(null);

    if (redirect) {
      window.location.href = redirectTo;
    }
  }, []);
  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  const login = useCallback((userData, token) => {
    // ✅ NEW: hanya simpan access token
    if (token) {
      setToken(token);
    }

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  }, []);

  // ─────────────────────────────────────────────
  // GLOBAL UNAUTHORIZED HANDLER
  // ─────────────────────────────────────────────
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout(true);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  // ─────────────────────────────────────────────
  // BOOTSTRAP AUTH
  // ─────────────────────────────────────────────
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ kalau tidak ada access token,
        // coba refresh via cookie
        if (!token) {
          try {
            const refreshRes = await refreshAuth();

            const newAccessToken =
              refreshRes.accessToken || refreshRes.token;

            if (newAccessToken) {
              setToken(newAccessToken);
            }
          } catch {
            setLoading(false);
            return;
          }
        }

        // ✅ verify user
        const res = await apiClient.get("/auth/verify");

        const verifiedUser = res.data?.user;

        if (verifiedUser) {
          setUser(verifiedUser);

          localStorage.setItem(
            "user",
            JSON.stringify(verifiedUser)
          );
        } else {
          logout(false);
        }
      } catch {
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,

        login,
        logout,

        loading,

        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider"
    );
  }

  return ctx;
}