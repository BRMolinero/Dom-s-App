import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import MainFooter from "./MainFooter";

export default function Layout() {
  const location = useLocation();
  
  // Páginas que no deben mostrar navbar y footer
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);

  if (isAuthPage) {
    // Para páginas de autenticación, solo mostrar el contenido
    return <Outlet />;
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
    </div>
  );
}
