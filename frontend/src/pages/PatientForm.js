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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data } = await api.get(`/patients/${id}`);
      const patient = data.data;
      setFormData({
        ...patient,
        dateOfBirth: patient.dateOfBirth.split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to load patient');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.put(`/patients/${id}`, formData);
        toast.success('Patient updated successfully');
      } else {
        await api.post('/patients', formData);
        toast.success('Patient created successfully');
      }
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
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
            <label>Date of Birth *</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

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

          <h3>Guardian Information (for minors)</h3>

          <div className="form-group">
            <label>Guardian Name</label>
            <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Guardian Contact</label>
            <input type="tel" name="guardianContact" value={formData.guardianContact} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Guardian Relation</label>
            <input type="text" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} />
          </div>

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
