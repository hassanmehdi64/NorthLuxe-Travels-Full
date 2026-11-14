import { useEffect, useMemo, useState } from "react";
import { apiClient, unwrap } from "../lib/apiClient";
import { AuthContext } from "./auth-context";

const TOKEN_KEY = "admin-token";
const USER_KEY = "admin-user";

const sanitizeUserForStorage = (user) => {
  if (!user) return null;
  const avatar = typeof user.avatar === "string" ? user.avatar.trim() : "";

  return {
    ...user,
    // Keep local session storage lightweight; large data URLs should come from the API/DB.
    avatar: avatar.startsWith("data:") ? "" : avatar,
  };
};

const persistStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(sanitizeUserForStorage(user)));
  } catch {
    // If storage quota is exceeded, keep auth alive via token and drop cached user snapshot.
    localStorage.removeItem(USER_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  // Server and first client render must match: start "checking" with no session,
  // then read storage after mount (avoids hydration error #418 on every admin page).
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageRead, setStorageRead] = useState(false);

  useEffect(() => {
    let storedToken = null;
    let storedUser = null;
    try {
      storedToken = localStorage.getItem(TOKEN_KEY);
      const raw = localStorage.getItem(USER_KEY);
      storedUser = raw ? JSON.parse(raw) : null;
    } catch {
      storedUser = null;
    }
    setToken(storedToken);
    setUser(storedUser);
    setStorageRead(true);
  }, []);

  useEffect(() => {
    if (!storageRead) return;
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiClient.get("/auth/me").then(unwrap);
        setUser(data.user);
        persistStoredUser(data.user);
      } catch (error) {
        // Keep session on transient failures; clear only when token is truly invalid.
        if (error?.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token, storageRead]);

  const login = async (email, password) => {
    const data = await apiClient.post("/auth/login", { email, password }).then(unwrap);
    localStorage.setItem(TOKEN_KEY, data.token);
    persistStoredUser(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const setUserData = (nextUser) => {
    setUser(nextUser);
    persistStoredUser(nextUser);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUserData,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
