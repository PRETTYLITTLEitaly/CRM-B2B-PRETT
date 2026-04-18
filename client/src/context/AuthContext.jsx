import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Se non c'è il token, smettiamo subito di caricare (ProtectedRoute farà il redirect)
    if (!token) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setUser(result.data);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
