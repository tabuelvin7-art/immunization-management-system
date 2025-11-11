import React from 'react';
import { Link } from 'react-router-dom';
import EnhancedCard from './EnhancedCard';

const AccessDenied = ({ message, allowedRoles = [] }) => {
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      <EnhancedCard className="danger">
        <div style={{ padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Access Denied</h2>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            {message || 'You do not have permission to access this feature.'}
          </p>
          
          {allowedRoles.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                <strong>Authorized Roles:</strong>
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {allowedRoles.map(role => (
                  <span 
                    key={role}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">
              🏠 Go to Dashboard
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-secondary"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
};

export default AccessDenied;