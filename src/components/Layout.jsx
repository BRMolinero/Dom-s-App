import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainNavbar from "./MainNavbar";
import MainFooter from "./MainFooter";
import ModalAlertaCritica from "./ModalAlertaCritica";
import PWAUpdatePrompt from "./PWAUpdatePrompt";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, bootstrapped } = useAuth();
  
  // Páginas que no requieren autenticación
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);

  // Proteger rutas que requieren autenticación
  useEffect(() => {
    // Si no está bootstrapped, no hacer nada todavía
    if (!bootstrapped) return;
    
    // Si no es una página de auth y no está autenticado, redirigir a login
    if (!isAuthPage && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    
    // Si está autenticado y está en login o register, redirigir a home
    if (isAuthPage && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [bootstrapped, isAuthenticated, isAuthPage, navigate]);

  if (isAuthPage) {
    // Para páginas de autenticación, mostrar el contenido
    return <Outlet />;
  }

  // Mostrar loading mientras se completa el bootstrap
  if (!bootstrapped) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (ya se está redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Para páginas normales, mostrar navbar y footer
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#FFFFFF'
    }}>
      <MainNavbar />
      <main style={{ 
        paddingTop: 64, 
        flex: 1,
        backgroundColor: '#FFFFFF'
      }}>
        <Outlet />
      </main>
      <MainFooter />
      {/* Modal de alertas críticas - aparece en todas las páginas */}
      <ModalAlertaCritica />
      {/* Notificación de actualizaciones PWA */}
      <PWAUpdatePrompt />
    </div>
  );
}
