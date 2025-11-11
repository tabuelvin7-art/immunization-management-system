import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import EnhancedCard from '../components/EnhancedCard';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate password change if attempted
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Current password is required to change password');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters');
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const { data } = await api.put('/auth/update-profile', updateData);
      
      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Refresh the page to update user context
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>👤 My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary">
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <EnhancedCard>
        {!isEditing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Name</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50' }}>{user.name}</p>
              </div>

              <div>
                <h3 style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Email Address</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50' }}>{user.email}</p>
              </div>

              <div>
                <h3 style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Role</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50' }}>
                  {user.role === 'Admin' && '⚙️ Administrator'}
                  {user.role === 'Doctor' && '👨‍⚕️ Doctor'}
                  {user.role === 'Nurse' && '👩‍⚕️ Nurse'}
                  {user.role === 'Parent' && '👨‍👩‍👧‍👦 Parent/Guardian'}
                </p>
              </div>

              <div>
                <h3 style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Account Status</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#27ae60' }}>
                  ✅ Active
                </p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🔐 Security</h3>
              <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Your password is encrypted and secure. Click "Edit Profile" to change your password.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Edit Profile Information</h2>

            <div className="form-group">
              <label>👤 Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>📧 Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              background: 'rgba(248, 249, 250, 0.8)', 
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>🔒 Change Password (Optional)</h3>
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Leave blank if you don't want to change your password
              </p>

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password (min 8 characters)"
                  minLength="8"
                />
                <small style={{ color: '#6c757d', display: 'block', marginTop: '0.25rem' }}>
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </small>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? '💾 Saving...' : '💾 Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancel}
                disabled={loading}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        )}
      </EnhancedCard>

      <EnhancedCard style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📋 Account Information</h3>
        <div style={{ color: '#6c757d', lineHeight: '1.6' }}>
          <p><strong>Role Permissions:</strong></p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            {user.role === 'Admin' && (
              <>
                <li>Full system access and management</li>
                <li>User management and role assignment</li>
                <li>System configuration and settings</li>
              </>
            )}
            {user.role === 'Doctor' && (
              <>
                <li>View and manage patient records</li>
                <li>Administer and record immunizations</li>
                <li>Generate parent verification codes</li>
              </>
            )}
            {user.role === 'Nurse' && (
              <>
                <li>View and manage patient records</li>
                <li>Administer and record immunizations</li>
                <li>Manage vaccine inventory</li>
                <li>Generate parent verification codes</li>
              </>
            )}
            {user.role === 'Parent' && (
              <>
                <li>View your children's immunization records</li>
                <li>Receive notifications for upcoming vaccines</li>
                <li>Access immunization schedules</li>
              </>
            )}
          </ul>
        </div>
      </EnhancedCard>
    </div>
  );
};

export default UserProfile;
