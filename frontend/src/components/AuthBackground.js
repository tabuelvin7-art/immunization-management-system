import React, { useEffect } from 'react';
import backgroundImage from '../assets/Authbackground.jpg';
import './AuthBackground.css';

const AuthBackground = ({ children }) => {
  useEffect(() => {
    // Set the background image as a CSS custom property
    document.documentElement.style.setProperty('--auth-background-image', `url(${backgroundImage})`);
  }, []);

  return (
    <div className="auth-background">
      <div className="auth-overlay">
        {children}
      </div>
      <div className="floating-elements">
        <div className="floating-element element-1">💉</div>
        <div className="floating-element element-2">🏥</div>
        <div className="floating-element element-3">👨‍⚕️</div>
        <div className="floating-element element-4">📋</div>
        <div className="floating-element element-5">🩺</div>
        <div className="floating-element element-6">💊</div>
      </div>
    </div>
  );
};

export default AuthBackground;