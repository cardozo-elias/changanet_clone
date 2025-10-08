// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // <-- Se importa la nueva librería

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Este useEffect ahora es el "cerebro" que recuerda al usuario.
  useEffect(() => {
    // 1. Busca el token con el nombre correcto que guardamos en App.jsx.
    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        // 2. Decodifica el token para obtener los datos del usuario (userId, role).
        const decodedToken = jwtDecode(token);

        // 3. Guarda los datos del usuario en el estado de la aplicación.
        setUser({
          id: decodedToken.userId,
          role: decodedToken.role,
          // Puedes añadir más datos si los incluyes en el token desde el backend.
        });

      } catch (error) {
        // Si el token es inválido o expiró, lo borramos.
        console.error("Error al decodificar el token:", error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    // 4. Termina de cargar la app.
    setLoading(false);
  }, []);

  // Esta función es para el login tradicional, la dejamos por si la necesitas.
  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    // Al cerrar sesión, borramos el token y reseteamos el usuario.
    localStorage.removeItem('authToken');
    setUser(null);
  };
  
 
  // Tu Header ahora solo necesita saber si 'user' existe o no.

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>  
  );
};