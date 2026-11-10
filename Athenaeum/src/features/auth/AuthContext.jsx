import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authenticate, findUser } from "./accounts";

const STORAGE_KEY = "athenaeum.session";

const AuthContext = createContext(null);

// Sesi hanya menyimpan username; data user diambil ulang dari daftar akun
// sehingga role tidak bisa diubah lewat storage.
function loadSession() {
  try {
    const username = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return username ? findUser(username) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage tidak tersedia */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);

  const login = useCallback((username, password, role, remember = false) => {
    const result = authenticate(username, password, role);
    if (!result.ok) return result;

    clearSession();
    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, result.user.username);
    } catch {
      /* sesi tetap berlaku selama tab terbuka lewat state */
    }
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
