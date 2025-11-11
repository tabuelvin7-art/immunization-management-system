import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, children, size = 'normal', animated = false }) => {
  const badgeClasses = [
    'status-badge',
    `status-badge-${status}`,
    `status-badge-${size}`,
    animated ? 'status-badge-animated' : ''
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export default StatusBadge;