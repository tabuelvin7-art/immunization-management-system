import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const ImmunizationList = () => {
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchImmunizations();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchImmunizations = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/immunizations', { params });
      setImmunizations(data.data);
    } catch (error) {
      toast.error('Failed to load immunizations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/immunizations/${id}`);
        toast.success('Record deleted successfully');
        fetchImmunizations();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Immunization Records</h1>
        {user && ['Doctor', 'Nurse'].includes(user.role) && (
          <Link to="/immunizations/new" className="btn btn-primary">Add Record</Link>
        )}
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Due">Due</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {immunizations.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Vaccine</th>
                <th>Date Administered</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {immunizations.map((imm) => (
                <tr key={imm._id}>
                  <td>
                    <Link to={`/patients/${imm.patient._id}`}>{imm.patient.name}</Link>
                  </td>
                  <td>{imm.vaccineName}</td>
                  <td>{new Date(imm.dateAdministered).toLocaleDateString()}</td>
                  <td>{imm.nextDueDate ? new Date(imm.nextDueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{imm.status}</td>
                  <td>
                    {user && ['Doctor', 'Nurse'].includes(user.role) && (
                      <>
                        <Link to={`/immunizations/edit/${imm._id}`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(imm._id)} className="btn btn-danger">
                          Delete
                        </button>
                      </>
                    )}
                    {user && !['Doctor', 'Nurse'].includes(user.role) && (
                      <span style={{ color: '#6c757d', fontStyle: 'italic' }}>View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No immunization records found</p>
        )}
      </div>
    </div>
  );
};

export default ImmunizationList;
