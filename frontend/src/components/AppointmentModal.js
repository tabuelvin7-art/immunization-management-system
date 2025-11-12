import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2>Schedule Appointment</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
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
