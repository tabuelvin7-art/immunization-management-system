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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchPatients();
    if (id) {
      fetchImmunization();
    } else {
      const patientId = searchParams.get('patientId');
      if (patientId) {
        setFormData(prev => ({ ...prev, patient: patientId }));
      }
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/patients');
      setPatients(data.data);
    } catch (error) {
      toast.error('Failed to load patients');
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
            <label>Vaccine Name *</label>
            <input type="text" name="vaccineName" value={formData.vaccineName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Date Administered *</label>
            <input type="date" name="dateAdministered" value={formData.dateAdministered} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Batch Number *</label>
            <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Next Due Date</label>
            <input type="date" name="nextDueDate" value={formData.nextDueDate} onChange={handleChange} />
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
