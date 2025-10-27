import React from 'react';

const LoadingMessage = ({ 
  message = "Cargando...", 
  showSpinner = true, 
  className = "",
  spinnerSize = "h-16 w-16",
  textSize = "text-lg"
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[50vh] ${className}`}>
      <div className="text-center">
        {showSpinner && (
          <div className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-[#274181] mx-auto mb-4`}></div>
        )}
        <p className={`text-[#274181] ${textSize} font-semibold`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingMessage;







