import React from 'react';
import { getPasswordStrength } from '../utils/passwordValidation';
import './PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ password, showDetails = true }) => {
  if (!password) return null;
  
  const { strength, color, checks, percentage } = getPasswordStrength(password);
  
  return (
    <div className="password-strength-container">
      <div className="password-strength-bar">
        <div 
          className="password-strength-fill"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            transition: 'all 0.3s ease'
          }}
        />
      </div>
      
      <div className="password-strength-text" style={{ color }}>
        Password Strength: <strong>{strength}</strong>
      </div>
      
      {showDetails && (
        <div className="password-requirements">
          <div className="requirements-grid">
            <div className={`requirement ${checks.length ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.length ? '✓' : '✗'}
              </span>
              <span>At least 8 characters</span>
            </div>
            
            <div className={`requirement ${checks.lowercase ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.lowercase ? '✓' : '✗'}
              </span>
              <span>Lowercase letter (a-z)</span>
            </div>
            
            <div className={`requirement ${checks.uppercase ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.uppercase ? '✓' : '✗'}
              </span>
              <span>Uppercase letter (A-Z)</span>
            </div>
            
            <div className={`requirement ${checks.number ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.number ? '✓' : '✗'}
              </span>
              <span>Number (0-9)</span>
            </div>
            
            <div className={`requirement ${checks.special ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">
                {checks.special ? '✓' : '✗'}
              </span>
              <span>Special character (@$!%*?&)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;