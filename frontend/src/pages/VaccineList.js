import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const VaccineList = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      const { data } = await api.get('/vaccines');
      setVaccines(data.data);
    } catch (error) {
      toast.error('Failed to load vaccines');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vaccine?')) {
      try {
        await api.delete(`/vaccines/${id}`);
        toast.success('Vaccine deleted successfully');
        fetchVaccines();
      } catch (error) {
        toast.error('Failed to delete vaccine');
      }
    }
  };

  const isLowStock = (vaccine) => {
    return vaccine.quantity <= vaccine.minStockLevel;
  };

  const isExpired = (vaccine) => {
    return new Date(vaccine.expiryDate) < new Date();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Vaccine Inventory</h1>
        <Link to="/vaccines/new" className="btn btn-primary">Add Vaccine</Link>
      </div>

      <div className="card">
        {vaccines.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Quantity</th>
                <th>Batch Number</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.map((vaccine) => (
                <tr key={vaccine._id} style={{ 
                  backgroundColor: isExpired(vaccine) ? '#fadbd8' : isLowStock(vaccine) ? '#fcf3cf' : 'transparent' 
                }}>
                  <td data-label="Name">{vaccine.name}</td>
                  <td data-label="Manufacturer">{vaccine.manufacturer}</td>
                  <td data-label="Quantity">{vaccine.quantity}</td>
                  <td data-label="Batch Number">{vaccine.batchNumber}</td>
                  <td data-label="Expiry Date">{new Date(vaccine.expiryDate).toLocaleDateString()}</td>
                  <td data-label="Status">
                    {isExpired(vaccine) ? (
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Expired</span>
                    ) : isLowStock(vaccine) ? (
                      <span style={{ color: '#f39c12', fontWeight: 'bold' }}>Low Stock</span>
                    ) : (
                      <span style={{ color: '#27ae60' }}>In Stock</span>
                    )}
                  </td>
                  <td data-label="Actions">
                    <Link to={`/vaccines/edit/${vaccine._id}`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(vaccine._id)} className="btn btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vaccines found</p>
        )}
      </div>
    </div>
  );
};

export default VaccineList;
