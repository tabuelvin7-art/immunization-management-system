import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import './AppointmentModal.css';

const AppointmentModal = ({ isOpen, onClose, immunization, patientId, patientName }) => {
  const [formData, setFormData] = useState({
    preferredDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/appointments', {
        patientId,
        vaccineName: immunization.vaccineName,
        immunizationId: immunization._id,
        preferredDate: formData.preferredDate,
        notes: formData.notes
      });

      toast.success('Appointment request submitted! The clinic will contact you to confirm.');
      onClose();
      setFormData({ preferredDate: '', notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Schedule Appointment</h2>
        <p className="modal-subtitle">
          Request an appointment for <strong>{patientName}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vaccine</label>
            <input 
              type="text" 
              value={immunization.vaccineName} 
              readOnly 
              style={{ background: '#f8f9fa' }}
            />
          </div>

          <div className="form-group">
            <label>Preferred Date *</label>
            <input 
              type="date" 
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Any special requests or information..."
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
