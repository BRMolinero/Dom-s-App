import React from 'react';

const CustomAlert = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción", 
  message, 
  confirmText = "Aceptar", 
  cancelText = "Cancelar",
  type = "confirm" // "confirm", "success", "error", "warning"
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          confirmBg: 'bg-gradient-to-r from-[#0DC0E8] to-[#274181]',
          confirmHover: 'hover:from-[#274181] hover:to-[#0DC0E8]',
          confirmFocus: 'focus:ring-[#0DC0E8]/30'
        };
      case 'error':
        return {
          icon: '❌',
          confirmBg: 'bg-gradient-to-r from-[#D95766] to-[#F6963F]',
          confirmHover: 'hover:from-[#D95766]/90 hover:to-[#F6963F]/90',
          confirmFocus: 'focus:ring-[#D95766]/30'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmBg: 'bg-gradient-to-r from-[#F6963F] to-[#D95766]',
          confirmHover: 'hover:from-[#F6963F]/90 hover:to-[#D95766]/90',
          confirmFocus: 'focus:ring-[#F6963F]/30'
        };
      default: // confirm
        return {
          icon: '❓',
          confirmBg: 'bg-gradient-to-r from-[#0DC0E8] to-[#274181]',
          confirmHover: 'hover:from-[#274181] hover:to-[#0DC0E8]',
          confirmFocus: 'focus:ring-[#0DC0E8]/30'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-[#F5F2F2] rounded-2xl shadow-2xl border border-[#95CDD1]/20 w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#95CDD1]/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{styles.icon}</span>
            <h2 id="alert-title" className="text-xl font-bold text-[#274181]">
              {title}
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-xl hover:bg-[#95CDD1]/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#95CDD1]/30 hover:scale-110"
            aria-label="Cerrar"
          >
            <span className="text-[#274181]/70 text-xl font-bold">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#274181]/80 text-base leading-relaxed mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className={`flex gap-3 ${!cancelText ? 'justify-center' : ''}`}>
            <button
              onClick={handleConfirm}
              className={`${!cancelText ? 'w-full' : 'flex-1'} py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 ${styles.confirmBg} ${styles.confirmHover} ${styles.confirmFocus} shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:scale-[1.02]`}
            >
              {confirmText}
            </button>
            {cancelText && (
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-[#274181] bg-[#95CDD1]/20 hover:bg-[#95CDD1]/30 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#95CDD1]/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:scale-[1.02]"
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
