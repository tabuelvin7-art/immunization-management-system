// Password validation utility functions

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrength = (password) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  Object.values(checks).forEach(check => {
    if (check) score++;
  });
  
  let strength = 'Very Weak';
  let color = '#e74c3c';
  
  if (score >= 5) {
    strength = 'Very Strong';
    color = '#27ae60';
  } else if (score >= 4) {
    strength = 'Strong';
    color = '#2ecc71';
  } else if (score >= 3) {
    strength = 'Medium';
    color = '#f39c12';
  } else if (score >= 2) {
    strength = 'Weak';
    color = '#e67e22';
  }
  
  return {
    score,
    strength,
    color,
    checks,
    percentage: (score / 5) * 100
  };
};