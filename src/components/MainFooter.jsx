import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot } from "react-icons/fa";

// Iconos SVG personalizados para reemplazar Ant Design
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const MainFooter = () => {
  const navigate = useNavigate();
  
  const contactInfo = [
    {
      icon: <MailIcon />,
      title: 'Email',
      content: 'info@humanixtech.com'
    },
    {
      icon: <PhoneIcon />,
      title: 'Teléfono',
      content: '+54 9 3534 128030'
    },
    {
      icon: <LocationIcon />,
      title: 'Oficina',
      content: 'Corrientes 1098, Villa Maria, Córdoba'
    }
  ];

  return (
    <footer style={{ 
      backgroundColor: '#FFFFFF', 
      color: '#0B3C5D', 
      padding: '48px 0 24px',
      marginTop: 'auto',
      borderTop: '1px solid #E5E7EB'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Grid Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Brand Column */}
          <div style={{ textAlign: 'center' }}>
            <img 
              src="/logo domus robotOK.png" 
              alt="Domüs Robot" 
              style={{ width: 200, height: 200, objectFit: 'contain' }}
            />
          </div>

          {/* Contact Information Column */}
          <div>
            <h5 style={{ 
              color: '#0B3C5D', 
              marginBottom: 16,
              fontSize: '1.1rem',
              fontWeight: 500
            }}>
              Contacto
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contactInfo.map((info, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: '#0B3C5D', display: 'flex', alignItems: 'center' }}>
                    {info.icon}
                  </div>
                  <div>
                    <p style={{ 
                      color: '#4B5563', 
                      fontSize: 14, 
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {info.title}
                    </p>
                    <p style={{ 
                      color: '#0B3C5D', 
                      fontSize: 14,
                      margin: 0
                    }}>
                      {info.title === 'Email' ? (
                        <a 
                          href={`mailto:${info.content}`}
                          style={{ 
                            color: '#0B3C5D',
                            textDecoration: 'underline',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#00C2C7'}
                          onMouseLeave={(e) => e.target.style.color = '#0B3C5D'}
                        >
                          {info.content}
                        </a>
                      ) : info.title === 'Teléfono' ? (
                        <a 
                          href="https://wa.me/5493534128030?text=Hola humanix-tech, me interesa conocer más sobre sus soluciones tecnológicas."
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#0B3C5D',
                            textDecoration: 'underline',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#00C2C7'}
                          onMouseLeave={(e) => e.target.style.color = '#0B3C5D'}
                        >
                          {info.content}
                        </a>
                      ) : info.title === 'Oficina' ? (
                        <a 
                          href="https://maps.google.com/?q=Corrientes+1098,+Villa+Maria,+Córdoba"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#0B3C5D',
                            textDecoration: 'underline',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#00C2C7'}
                          onMouseLeave={(e) => e.target.style.color = '#0B3C5D'}
                        >
                          {info.content}
                        </a>
                      ) : (
                        info.content
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Column */}
          <div>
            <h5 style={{ 
              color: '#0B3C5D', 
              marginBottom: 16,
              fontSize: '1.1rem',
              fontWeight: 500
            }}>
              Síguenos
            </h5>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div
                style={{ 
                  color: '#4B5563',
                  cursor: 'default'
                }}
              >
                <LinkedinIcon />
              </div>
              <a
                href="https://www.youtube.com/channel/UC_2HmvmUtcuCeEOH1KfR8qg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en YouTube"
                style={{ 
                  color: '#4B5563',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#00C2C7'}
                onMouseLeave={(e) => e.target.style.color = '#4B5563'}
              >
                <YoutubeIcon />
              </a>
              <a
                href="https://www.instagram.com/domusxhumanix/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
                style={{ 
                  color: '#4B5563',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#00C2C7'}
                onMouseLeave={(e) => e.target.style.color = '#4B5563'}
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ 
          borderTop: '1px solid #E5E7EB', 
          margin: '32px 0 24px'
        }} />
        
        {/* Copyright */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            color: '#6B7280', 
            margin: 0,
            fontSize: '14px'
          }}>
            © 2025 humanix-tech. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
