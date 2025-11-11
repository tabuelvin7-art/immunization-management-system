import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AuthBackground from '../components/AuthBackground';
import PasswordInput from '../components/PasswordInput';
import { validatePassword } from '../utils/passwordValidation';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Parent'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error('Please ensure your password meets all requirements');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className="auth-card">
        <h2>🎯 Join Our Team</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-group">
            <label>📧 Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <PasswordInput
            value={formData.password}
            onChange={handleChange}
            name="password"
            placeholder="Create a secure password"
            label="Password"
            icon="🔒"
            showStrengthIndicator={true}
          />
          <div className="form-group">
            <label>🏷️ Your Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="Parent">👨‍👩‍👧‍👦 Parent/Guardian</option>
              <option value="Nurse">👩‍⚕️ Nurse</option>
              <option value="Doctor">👨‍⚕️ Doctor</option>
              <option value="Admin">⚙️ Administrator</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading || !validatePassword(formData.password).isValid}
          >
            {loading ? '⏳ Creating Account...' : '✨ Create Account'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </AuthBackground>
  );
};

export default Register;
