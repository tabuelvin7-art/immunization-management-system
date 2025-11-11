import React from 'react';
import './BackgroundOverlay.css';

const BackgroundOverlay = ({ children, opacity = 0.7 }) => {
  return (
    <div className="background-overlay" style={{ '--overlay-opacity': opacity }}>
      {children}
    </div>
  );
};

export default BackgroundOverlay;