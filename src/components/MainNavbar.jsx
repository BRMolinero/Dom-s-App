import React, { useState } from 'react';
import { FaRobot, FaBars, FaTimes, FaSignOutAlt, FaCog } from "react-icons/fa";
import LogoutModal from "./LogoutModal";

const MainNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfigClick = () => {
    if (window.openPhoneConfig) {
      window.openPhoneConfig();
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      console.log('Iniciando proceso de logout...');
      // Simular logout - redirigir a login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    {
      key: 'home',
      label: 'Inicio',
      onClick: () => window.location.href = '/'
    },
    {
      key: 'admin',
      label: 'Monitoreo Ambiental',
      onClick: () => window.location.href = '/admin'
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
              padding: '8px 8px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onClick={() => window.location.href = '/domus'}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 194, 199, 0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img 
              src="/logo domus robotOK.png" 
              alt="Domüs Robot" 
              style={{ width: 40, height: 40, objectFit: 'contain' }}
            />
          </div>

          {/* Desktop Menu */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16
          }} className="desktop-menu-container">
            <nav style={{ display: 'flex', gap: '8px' }}>
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#4B5563',
                    fontFamily: 'Rebelton, sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 194, 199, 0.05)';
                    e.target.style.color = '#0B3C5D';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#4B5563';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            
            {/* Botón de Configuración */}
            <button
              onClick={handleConfigClick}
              style={{ 
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #274181, #0DC0E8)',
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
              title="Configurar SOS"
            >
              <FaCog className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleLogoutClick}
              style={{ 
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00C2C7, #0B3C5D)',
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
              color: '#0B3C5D',
              fontSize: 20,
              width: 48,
              height: 48,
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              marginLeft: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            className="mobile-menu-button"
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
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
                style={{ width: 40, height: 40, objectFit: 'contain' }}
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#0B3C5D'
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Drawer Menu */}
          <nav style={{ marginBottom: '32px' }}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  item.onClick();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#4B5563',
                  fontFamily: 'Rebelton, sans-serif',
                  transition: 'all 0.3s ease',
                  marginBottom: '4px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 194, 199, 0.05)';
                  e.target.style.color = '#0B3C5D';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#4B5563';
                  e.target.style.transform = 'translateX(0)';
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Drawer Config Button */}
          <div style={{ 
            textAlign: 'center',
            padding: '0 24px',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => {
                handleConfigClick();
                setMobileMenuOpen(false);
              }}
              style={{ 
                width: '100%',
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #274181, #0DC0E8)',
                border: 'none',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px',
                fontFamily: 'Rebelton, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              title="Configurar SOS"
            >
              <FaCog className="w-4 h-4" />
              Configurar SOS
            </button>
          </div>

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
                background: 'linear-gradient(135deg, #00C2C7, #0B3C5D)',
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
