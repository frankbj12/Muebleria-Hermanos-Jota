import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AUTH_STORAGE_KEY,
  UNAUTHORIZED_EVENT,
  apiRequest,
} from '../services/apiClient';

export const AuthContext = createContext(null);
export { AUTH_STORAGE_KEY, UNAUTHORIZED_EVENT };

function readStoredSession() {
  try {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedSession) return { token: null, user: null };

    const session = JSON.parse(storedSession);
    return {
      token: typeof session.token === 'string' ? session.token : null,
      user: session.user && typeof session.user === 'object' ? session.user : null,
    };
  } catch (error) {
    console.error('No se pudo recuperar la sesion guardada:', error);
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const storedSession = useMemo(readStoredSession, []);
  const [user, setUser] = useState(storedSession.user);
  const [token, setToken] = useState(storedSession.token);
  const [loading, setLoading] = useState(Boolean(storedSession.token));

  const persistSession = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);

    try {
      if (nextUser && nextToken) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: nextUser, token: nextToken })
        );
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error('No se pudo guardar la sesion:', error);
    }
  }, []);

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const restoreSession = useCallback(async () => {
    if (!storedSession.token) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedSession.token}` },
      });
      persistSession(data.user ?? data, storedSession.token);
    } catch (error) {
      if (error.status === 401 || error.status === 404) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout, persistSession, storedSession.token]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout]);

  const completeAuthentication = useCallback(
    (data) => {
      if (!data?.token || !data?.user) {
        throw new Error('La API devolvio una respuesta de autenticacion invalida.');
      }

      persistSession(data.user, data.token);
      setLoading(false);
      return data.user;
    },
    [persistSession]
  );

  const login = useCallback(
    async (credentials) => {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return completeAuthentication(data);
    },
    [completeAuthentication]
  );

  const register = useCallback(
    async (details) => {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      return completeAuthentication(data);
    },
    [completeAuthentication]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Acceso al usuario autenticado y a las operaciones de sesión.
 *
 * Debe usarse dentro de AuthProvider. Expone user, token, loading,
 * login, register, logout e isAuthenticated.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return context;
}
