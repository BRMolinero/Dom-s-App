import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaTimes, FaSignOutAlt } from "react-icons/fa";
import "./LogoutModal.css";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const ctx = gsap.context(() => {
        gsap.from(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out"
        });
        
        gsap.from(modalRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 50,
          duration: 0.4,
          ease: "back.out(1.7)"
        });
      });

      return () => ctx.revert();
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onClose();
    // Pequeño delay para asegurar que el modal se cierre antes de la navegación
    setTimeout(() => {
      onConfirm();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="logout-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div ref={modalRef} className="logout-modal">
        <div className="logout-modal-header">
          <div className="logout-modal-icon">
            <FaSignOutAlt />
          </div>
          <h2 className="logout-modal-title">Cerrar Sesión</h2>
          <button 
            className="logout-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="logout-modal-body">
          <p className="logout-modal-message">
            ¿Estás seguro de que quieres cerrar sesión?
          </p>
        </div>
        
        <div className="logout-modal-footer">
          <button 
            className="logout-modal-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="logout-modal-confirm"
            onClick={handleConfirm}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
