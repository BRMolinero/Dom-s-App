import React, { useState } from 'react';
import { FaRobot, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { HiOutlineHome, HiOutlineShieldCheck, HiOutlineUser } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensorData } from '../context/SensorContext';
import LogoutModal from "./LogoutModal";

const MainNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { clearSessionData } = useSensorData();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      console.log('Iniciando proceso de logout...');
      
      // Limpiar datos de sesión en localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Limpiar datos adicionales de sesión si existen
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      
      // Limpiar datos del contexto de sensores y cerrar WebSocket
      if (clearSessionData) {
        clearSessionData();
      }
      
      // Cerrar sesión en el contexto de autenticación
      await logout();
      
      console.log('Sesión cerrada correctamente');
      
      // Redirigir a login reemplazando la entrada del historial para evitar volver atrás
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aunque haya error, redirigir a login reemplazando el historial
      navigate('/login', { replace: true });
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    {
      key: 'home',
      label: 'Inicio',
      icon: HiOutlineHome,
      path: '/'
    },
    {
      key: 'admin',
      label: 'Monitoreo Ambiental',
      icon: HiOutlineShieldCheck,
      path: '/admin'
    },
    {
      key: 'profile',
      label: 'Mi Perfil',
      icon: HiOutlineUser,
      path: '/profile'
    }
  ];

  return (
    <>
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        zIndex: 1000, 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 194, 199, 0.2)',
        transition: 'all 0.3s ease',
        height: '64px'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          position: 'relative'
        }}>
          {/* Logo */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '8px',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <img 
              src="/logo domus robotOK.png" 
              alt="Domüs Robot" 
              style={{ width: 120, height: 120, objectFit: 'contain' }}
            />
          </div>

          {/* Desktop Menu */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16
          }} className="desktop-menu-container">
            <nav style={{ display: 'flex', gap: '32px' }}>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '12px 0',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#4B5563',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textTransform: 'capitalize'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#0B3C5D';
                      e.target.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#4B5563';
                      e.target.style.opacity = '1';
                    }}
                  >
                    <IconComponent style={{ fontSize: '18px', strokeWidth: '1.5' }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            {/* Botón de Logout */}
            <button
              onClick={handleLogoutClick}
              style={{ 
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0DC0E8, #274181)',
                border: 'none',
                color: 'white',
                fontWeight: 600,
                fontSize: '15px',
                transition: 'all 0.3s ease',
                marginLeft: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
              title="Cerrar Sesión"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{ 
              display: 'none',
              color: '#4B5563',
              fontSize: 20,
              width: 40,
              height: 40,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              marginLeft: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            className="mobile-menu-button"
            onMouseEnter={(e) => {
              e.target.style.color = '#0B3C5D';
              e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#4B5563';
              e.target.style.opacity = '1';
            }}
          >
            <FaBars />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '320px',
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          zIndex: 1001,
          padding: '24px',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Drawer Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img 
                src="/logo domus robotOK.png" 
                alt="Domüs Robot" 
                style={{ width: 120, height: 120, objectFit: 'contain' }}
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#4B5563',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#0B3C5D';
                e.target.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#4B5563';
                e.target.style.opacity = '1';
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Drawer Menu */}
          <nav style={{ marginBottom: '32px' }}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '12px 0',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#4B5563',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    transition: 'all 0.3s ease',
                    marginBottom: '8px',
                    textAlign: 'left',
                    gap: '12px',
                    textTransform: 'capitalize'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#0B3C5D';
                    e.target.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4B5563';
                    e.target.style.opacity = '1';
                  }}
                >
                  <IconComponent style={{ fontSize: '18px', strokeWidth: '1.5' }} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Drawer Logout Button */}
          <div style={{ 
            textAlign: 'center',
            padding: '0 24px'
          }}>
            <button
              onClick={handleLogoutClick}
              style={{ 
                width: '100%',
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0DC0E8, #274181)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: 'Rebelton, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              title="Cerrar Sesión"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
      
      {/* Custom CSS for responsive design */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: flex !important;
          }
          
          .desktop-menu-container {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default MainNavbar;
