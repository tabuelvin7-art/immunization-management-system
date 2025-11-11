import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const PatientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    contactNumber: '',
    email: '',
    address: '',
    guardianName: '',
    guardianContact: '',
    guardianRelation: ''
  });
  const [age, setAge] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data } = await api.get(`/patients/${id}`);
      const patient = data.data;
      const dob = patient.dateOfBirth.split('T')[0];
      setFormData({
        ...patient,
        dateOfBirth: dob
      });
      setAge(calculateAge(dob));
    } catch (error) {
      toast.error('Failed to load patient');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Calculate age when date of birth changes
    if (name === 'dateOfBirth') {
      const calculatedAge = calculateAge(value);
      setAge(calculatedAge);
      
      // Clear adult-only fields if minor
      if (calculatedAge !== null && calculatedAge < 18) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          contactNumber: '',
          email: '',
          address: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data - ensure empty strings for optional fields if minor
      const submitData = { ...formData };
      
      // For minors, ensure contact fields are empty or null
      if (age !== null && age < 18) {
        submitData.contactNumber = '';
        submitData.email = '';
        submitData.address = '';
      }

      if (id) {
        await api.put(`/patients/${id}`, submitData);
        toast.success('Patient updated successfully');
      } else {
        await api.post('/patients', submitData);
        toast.success('Patient created successfully');
      }
      navigate('/patients');
    } catch (error) {
      console.error('Patient registration error:', error.response?.data);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.errors?.[0]?.msg ||
                       'Operation failed. Please check all required fields.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{id ? 'Edit Patient' : 'Add Patient'}</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>📅 Date of Birth *</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
            {age !== null && (
              <small style={{ 
                display: 'block', 
                marginTop: '0.5rem', 
                padding: '0.5rem',
                background: age < 18 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                color: age < 18 ? '#856404' : '#155724',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {age < 18 ? '👶' : '👤'} Age: {age} years old {age < 18 ? '(Minor - Guardian information required)' : '(Adult)'}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Show contact fields only for adults (18+) */}
          {age !== null && age >= 18 && (
            <>
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(40, 167, 69, 0.1)', 
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid rgba(40, 167, 69, 0.3)'
              }}>
                <h3 style={{ color: '#155724', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  📞 Contact Information (Adult Patient)
                </h3>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="3"></textarea>
                </div>
              </div>
            </>
          )}

          {/* Show guardian fields for minors or always in edit mode */}
          {(age === null || age < 18) && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255, 193, 7, 0.1)', 
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
              <h3 style={{ color: '#856404', marginBottom: '1rem', fontSize: '1.1rem' }}>
                👨‍👩‍👧‍👦 Guardian Information {age !== null && age < 18 ? '(Required for Minor)' : ''}
              </h3>

              <div className="form-group">
                <label>Guardian Name {age !== null && age < 18 ? '*' : ''}</label>
                <input 
                  type="text" 
                  name="guardianName" 
                  value={formData.guardianName} 
                  onChange={handleChange}
                  required={age !== null && age < 18}
                  placeholder="Full name of guardian"
                />
              </div>

              <div className="form-group">
                <label>Guardian Contact {age !== null && age < 18 ? '*' : ''}</label>
                <input 
                  type="tel" 
                  name="guardianContact" 
                  value={formData.guardianContact} 
                  onChange={handleChange}
                  required={age !== null && age < 18}
                  placeholder="Guardian's phone number"
                />
              </div>

              <div className="form-group">
                <label>Guardian Relation {age !== null && age < 18 ? '*' : ''}</label>
                <input 
                  type="text" 
                  name="guardianRelation" 
                  value={formData.guardianRelation} 
                  onChange={handleChange}
                  required={age !== null && age < 18}
                  placeholder="e.g., Mother, Father, Legal Guardian"
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/patients')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
