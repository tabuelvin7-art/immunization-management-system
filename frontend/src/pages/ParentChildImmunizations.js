import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ParentChildImmunizations = () => {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      const [childRes, immunizationsRes] = await Promise.all([
        api.get(`/parent/children/${id}`),
        api.get(`/parent/children/${id}/immunizations`)
      ]);
      setChild(childRes.data.data);
      setImmunizations(immunizationsRes.data.data);
    } catch (error) {
      toast.error('Failed to load immunization records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{child?.name}'s Immunization Records</h1>
        <Link to="/parent/children" className="btn btn-secondary">Back to Children</Link>
      </div>

      {immunizations.length > 0 ? (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Date Administered</th>
                <th>Batch Number</th>
                <th>Next Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {immunizations.map((imm) => (
                <tr key={imm._id}>
                  <td>{imm.vaccineName}</td>
                  <td>{new Date(imm.dateAdministered).toLocaleDateString()}</td>
                  <td>{imm.batchNumber}</td>
                  <td>
                    {imm.nextDueDate 
                      ? new Date(imm.nextDueDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge badge-${
                      imm.status === 'Completed' ? 'success' : 
                      imm.status === 'Due' ? 'warning' : 'danger'
                    }`}>
                      {imm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Immunization Records</h3>
          <p style={{ color: '#7f8c8d' }}>
            No immunization records found for {child?.name}.
          </p>
        </div>
      )}
    </div>
  );
};

export default ParentChildImmunizations;
