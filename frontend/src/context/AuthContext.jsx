import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('ulalert_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const loginWithGoogle = async (credentialResponse) => {
    try {
      setLoading(true);
      const token = credentialResponse.credential; // Extraer token crudo
      const decodedToken = jwtDecode(token);
      const email = decodedToken.email;

      // Validación de dominio (Aceptamos @alumnos.ulagos.cl, coordinador y admin para pruebas)
      if (!email.endsWith('@alumnos.ulagos.cl') && email !== 'admin@ulagos.cl' && email !== 'coordinador@ulagos.cl') {
        setLoading(false);
        return { success: false, message: 'El correo debe pertenecer a @alumnos.ulagos.cl' };
      }

      // Consultar rol en el Backend enviando el TOKEN (para que la Lambda verifique criptográficamente)
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }) // Aquí estaba el error, mandábamos 'email' pero AWS pedía 'token'
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data = await response.json();
      const role = data.role || 'student';

      const newUser = { email: decodedToken.email, role, name: decodedToken.name, picture: decodedToken.picture, token };
      setUser(newUser);
      localStorage.setItem('ulalert_user', JSON.stringify(newUser));
      setLoading(false);

      return { success: true };
    } catch (error) {
      console.error("Error validando sesión:", error);
      setLoading(false);
      return { success: false, message: 'Error interno al validar la sesión' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ulalert_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

