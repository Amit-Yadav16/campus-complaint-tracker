import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('cct_user');
    const storedToken = localStorage.getItem('cct_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupt storage — clear it
        localStorage.removeItem('cct_user');
        localStorage.removeItem('cct_token');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login — calls POST /api/auth/login, stores token and user.
   * Throws on failure so the Login page can show the error message.
   */
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('cct_token', data.token);
    localStorage.setItem('cct_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('cct_token');
    localStorage.removeItem('cct_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
