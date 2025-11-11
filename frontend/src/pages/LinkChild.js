import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import EnhancedCard from '../components/EnhancedCard';

const LinkChild = () => {
  const [formData, setFormData] = useState({
    childId: '',
    verificationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!formData.childId.trim()) {
      toast.error('Please enter the Patient ID');
      setLoading(false);
      return;
    }

    if (!formData.verificationCode.trim()) {
      toast.error('Please enter the verification code');
      setLoading(false);
      return;
    }

    if (formData.verificationCode.length !== 6) {
      toast.error('Verification code must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting link child request:', {
        childId: formData.childId.trim(),
        verificationCode: formData.verificationCode.trim()
      });

      const response = await api.post('/parent/link-child', {
        childId: formData.childId.trim(),
        verificationCode: formData.verificationCode.trim()
      });

      console.log('Link child response:', response.data);
      toast.success(`🎉 ${response.data.message || 'Child successfully linked to your account!'}`);
      navigate('/parent/children');
    } catch (error) {
      console.error('Link child error:', error.response?.data);
      
      let errorMessage = 'Failed to link child account';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid patient ID or verification code';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please ensure you have a parent account.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      toast.error(errorMessage);
      
      // Show debug info in development
      if (error.response?.data?.debug && process.env.NODE_ENV === 'development') {
        console.log('Debug info:', error.response.data.debug);
        toast.info('Check console for debug information');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔗 Link Child Account</h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <EnhancedCard className="info">
          <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(23, 162, 184, 0.1)', borderRadius: '12px', border: '1px solid rgba(23, 162, 184, 0.2)' }}>
            <h3 style={{ color: '#17a2b8', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📋 How to Link Your Child
            </h3>
            <ol style={{ color: '#17a2b8', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>Contact your healthcare provider or visit the clinic</li>
              <li>Request a verification code for your child's immunization records</li>
              <li>Get your child's patient ID from the healthcare provider</li>
              <li>Enter both the patient ID and verification code below</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Child's Patient ID *</label>
              <input
                type="text"
                name="childId"
                value={formData.childId}
                onChange={handleChange}
                placeholder="Enter the patient ID provided by your healthcare provider"
                required
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  letterSpacing: '1px'
                }}
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '0.5rem' }}>
                💡 This is usually a unique identifier like "PAT001234" or similar
              </small>
            </div>

            <div className="form-group">
              <label>Verification Code *</label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, verificationCode: value });
                }}
                placeholder="000000"
                required
                maxLength="6"
                pattern="[0-9]{6}"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.5rem',
                  letterSpacing: '3px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: formData.verificationCode.length === 6 ? '#28a745' : '#6c757d'
                }}
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '0.5rem' }}>
                🔐 This is a 6-digit security code from your healthcare provider
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Linking...' : '🔗 Link Child Account'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/parent/children')}
                disabled={loading}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </EnhancedCard>

        <EnhancedCard>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ❓ Need Help?
          </h3>
          <div style={{ color: '#6c757d' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>Can't find your child's Patient ID?</strong></p>
              <p>Contact your healthcare provider's front desk. They can provide you with:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Your child's unique patient identifier</li>
                <li>A verification code to link the account</li>
                <li>Instructions for accessing immunization records</li>
              </ul>
            </div>
            
            <div>
              <p><strong>🔒 Security & Privacy</strong></p>
              <p>
                We take your child's privacy seriously. The verification process ensures that only 
                authorized parents/guardians can access immunization records. All data is encrypted 
                and stored securely.
              </p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard className="warning">
          <h4 style={{ color: '#856404', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Important Notes
          </h4>
          <ul style={{ color: '#856404', paddingLeft: '1.5rem', margin: 0, lineHeight: '1.6' }}>
            <li>Each child requires a separate linking process</li>
            <li>Verification codes are typically valid for 48 hours</li>
            <li>You must be listed as the parent/guardian in the medical records</li>
            <li>Contact your healthcare provider if you encounter any issues</li>
            <li>Make sure to use the exact email address provided to the healthcare staff</li>
          </ul>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default LinkChild;