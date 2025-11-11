import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const VaccineForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    quantity: '',
    batchNumber: '',
    expiryDate: '',
    minStockLevel: 10
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchVaccine = useCallback(async () => {
    try {
      const { data } = await api.get(`/vaccines/${id}`);
      const vaccine = data.data;
      setFormData({
        ...vaccine,
        expiryDate: vaccine.expiryDate.split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to load vaccine');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchVaccine();
    }
  }, [id, fetchVaccine]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.put(`/vaccines/${id}`, formData);
        toast.success('Vaccine updated successfully');
      } else {
        await api.post('/vaccines', formData);
        toast.success('Vaccine added successfully');
      }
      navigate('/vaccines');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{id ? 'Edit Vaccine' : 'Add Vaccine'}</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vaccine Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Manufacturer *</label>
            <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" />
          </div>

          <div className="form-group">
            <label>Batch Number *</label>
            <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Expiry Date *</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Minimum Stock Level</label>
            <input type="number" name="minStockLevel" value={formData.minStockLevel} onChange={handleChange} min="0" />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/vaccines')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaccineForm;
