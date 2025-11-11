import React from 'react';
import './EnhancedCard.css';

const EnhancedCard = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  padding = 'normal',
  ...props 
}) => {
  const cardClasses = [
    'enhanced-card',
    hover ? 'enhanced-card-hover' : '',
    gradient ? 'enhanced-card-gradient' : '',
    `enhanced-card-padding-${padding}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default EnhancedCard;