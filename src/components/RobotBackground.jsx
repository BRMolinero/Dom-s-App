import React from 'react';

const RobotBackground = () => {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Moving particles with brand colors */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => {
          const colors = ['#95CDD1', '#274181', '#F6963F', '#D95766', '#0DC0E8', '#F5F2F2'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-ping"
              style={{
                backgroundColor: randomColor,
                opacity: 0.3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RobotBackground;
