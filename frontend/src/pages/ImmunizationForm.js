import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ImmunizationForm = () => {
  const [formData, setFormData] = useState({
    patient: '',
    vaccineName: '',
    dateAdministered: '',
    batchNumber: '',
    nextDueDate: '',
    notes: '',
    status: 'Completed'
  });
  const [patients, setPatients] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadData = async () => {
      await fetchPatients();
      await fetchVaccines();
      if (id) {
        await fetchImmunization();
      } else {
        const patientId = searchParams.get('patientId');
        if (patientId) {
          setFormData(prev => ({ ...prev, patient: patientId }));
        }
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, searchParams]);

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/patients');
      setPatients(data.data);
    } catch (error) {
      toast.error('Failed to load patients');
    }
  };

  const fetchVaccines = async () => {
    try {
      const { data } = await api.get('/vaccines');
      setVaccines(data.data);
    } catch (error) {
      toast.error('Failed to load vaccines');
    }
  };

  const fetchImmunization = async () => {
    try {
      const { data } = await api.get(`/immunizations/${id}`);
      const imm = data.data;
      setFormData({
        patient: imm.patient._id,
        vaccineName: imm.vaccineName,
        dateAdministered: imm.dateAdministered.split('T')[0],
        batchNumber: imm.batchNumber,
        nextDueDate: imm.nextDueDate ? imm.nextDueDate.split('T')[0] : '',
        notes: imm.notes || '',
        status: imm.status
      });
    } catch (error) {
      toast.error('Failed to load immunization');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVaccineSelect = (e) => {
    const vaccineId = e.target.value;
    const vaccine = vaccines.find(v => v._id === vaccineId);
    
    if (vaccine) {
      setSelectedVaccine(vaccine);
      setFormData({
        ...formData,
        vaccineName: vaccine.name,
        batchNumber: vaccine.batchNumber
      });
    } else {
      setSelectedVaccine(null);
      setFormData({
        ...formData,
        vaccineName: '',
        batchNumber: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.put(`/immunizations/${id}`, formData);
        toast.success('Immunization updated successfully');
      } else {
        await api.post('/immunizations', formData);
        toast.success('Immunization recorded successfully');
      }
      navigate('/immunizations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{id ? 'Edit Immunization' : 'Add Immunization'}</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient *</label>
            <select name="patient" value={formData.patient} onChange={handleChange} required>
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>💉 Select Vaccine *</label>
            <select onChange={handleVaccineSelect} required>
              <option value="">Select a vaccine</option>
              {vaccines.map(v => (
                <option key={v._id} value={v._id}>
                  {v.name} - {v.manufacturer} (Stock: {v.quantity})
                </option>
              ))}
            </select>
          </div>

          {selectedVaccine && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(102, 126, 234, 0.1)', 
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>📋 Vaccine Information</h4>
              <div style={{ fontSize: '0.9rem', color: '#6c757d', lineHeight: '1.6' }}>
                <p><strong>Description:</strong> {selectedVaccine.description}</p>
                <p><strong>Batch Number:</strong> {selectedVaccine.batchNumber}</p>
                <p><strong>Expiry Date:</strong> {new Date(selectedVaccine.expiryDate).toLocaleDateString()}</p>
                <p><strong>Age Group:</strong> {selectedVaccine.ageGroup}</p>
                <p><strong>Dosage:</strong> {selectedVaccine.dosage}</p>
                <p><strong>Storage:</strong> {selectedVaccine.storageConditions}</p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Vaccine Name *</label>
            <input 
              type="text" 
              name="vaccineName" 
              value={formData.vaccineName} 
              onChange={handleChange} 
              required 
              readOnly
              style={{ background: '#f8f9fa' }}
            />
          </div>

          <div className="form-group">
            <label>Date Administered *</label>
            <input type="date" name="dateAdministered" value={formData.dateAdministered} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Batch Number *</label>
            <input 
              type="text" 
              name="batchNumber" 
              value={formData.batchNumber} 
              onChange={handleChange} 
              required 
              readOnly
              style={{ background: '#f8f9fa' }}
            />
          </div>

          <div className="form-group">
            <label>Next Due Date</label>
            <input 
              type="date" 
              name="nextDueDate" 
              value={formData.nextDueDate} 
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Completed">Completed</option>
              <option value="Due">Due</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/immunizations')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImmunizationForm;
