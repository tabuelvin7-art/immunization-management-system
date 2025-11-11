import React, { useState } from 'react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordValidation';

const PasswordInput = ({ 
  value, 
  onChange, 
  name = 'password',
  placeholder = 'Enter password',
  required = true,
  showStrengthIndicator = true,
  label = 'Password',
  icon = '🔒'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const isValid = validatePassword(value).isValid;
  
  return (
    <div className="form-group">
      <label>{icon} {label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength="8"
          style={{
            paddingRight: '3rem',
            borderColor: value && !isValid ? '#e74c3c' : undefined
          }}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#6c757d'
          }}
          tabIndex={-1}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      {showStrengthIndicator && value && (
        <PasswordStrengthIndicator password={value} />
      )}
    </div>
  );
};

export default PasswordInput;