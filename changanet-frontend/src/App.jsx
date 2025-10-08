import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Professionals from './pages/Professionals';
import ProfessionalDetail from './pages/ProfessionalDetail';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Header from './components/Header';
import Footer from './components/Footer';
import './index.css';

function App() {

  // --- CÓDIGO FINAL Y DIRECTO ---
  useEffect(() => {
  // Busca un "token" en la URL actual.
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  // Si lo encuentra...
  if (token) {
    // Lo guarda en la memoria del navegador.
    localStorage.setItem('authToken', token);
    // Limpia la URL para que no se vea el token.
    window.history.replaceState({}, document.title, "/");
    // Recarga la página para que la app reconozca al usuario como "conectado".
    window.location.reload();
  }
}, []); // Se ejecuta solo una vez cuando carga la página.

  // --- FIN DEL CÓDIGO FINAL ---

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profesionales" element={<Professionals />} />
              <Route path="/profesional/:id" element={<ProfessionalDetail />} />
              <Route path="/mi-cuenta" element={<Dashboard />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/terminos" element={<Terms />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;