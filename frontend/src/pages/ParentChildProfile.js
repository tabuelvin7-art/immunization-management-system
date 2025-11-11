import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ParentChildProfile = () => {
  const [child, setChild] = useState(null);
  const [immunizations, setImmunizations] = useState([]);
  const [upcomingImmunizations, setUpcomingImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    fetchChildData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChildData = async () => {
    try {
      const [childRes, immunizationsRes, upcomingRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/parent/children/${id}/immunizations`),
        api.get(`/parent/children/${id}/upcoming`)
      ]);
      setChild(childRes.data.data);
      setImmunizations(immunizationsRes.data.data);
      setUpcomingImmunizations(upcomingRes.data.data);
    } catch (error) {
      toast.error('Failed to load child data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!child) return <div>Child not found</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{child.name}'s Profile</h1>
        <Link to="/parent/children" className="btn btn-secondary">Back to Children</Link>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Full Name:</strong> {child.name}
          </div>
          <div>
            <strong>Age:</strong> {calculateAge(child.dateOfBirth)} years old
          </div>
          <div>
            <strong>Date of Birth:</strong> {new Date(child.dateOfBirth).toLocaleDateString()}
          </div>
          <div>
            <strong>Gender:</strong> {child.gender}
          </div>
          <div>
            <strong>Contact:</strong> {child.contactNumber}
          </div>
          {child.email && (
            <div>
              <strong>Email:</strong> {child.email}
            </div>
          )}
          {child.address && (
            <div>
              <strong>Address:</strong> {child.address}
            </div>
          )}
        </div>

        {child.guardianName && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Guardian Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <strong>Name:</strong> {child.guardianName}
              </div>
              <div>
                <strong>Contact:</strong> {child.guardianContact}
              </div>
              <div>
                <strong>Relation:</strong> {child.guardianRelation}
              </div>
            </div>
          </div>
        )}
      </div>

      {upcomingImmunizations.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Upcoming Immunizations</h2>
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Days Until Due</th>
                </tr>
              </thead>
              <tbody>
                {upcomingImmunizations.map((imm) => {
                  const daysUntilDue = Math.ceil((new Date(imm.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={imm._id} style={{ 
                      backgroundColor: daysUntilDue < 0 ? '#fadbd8' : daysUntilDue <= 7 ? '#fcf3cf' : 'transparent' 
                    }}>
                      <td>{imm.vaccineName}</td>
                      <td>{new Date(imm.nextDueDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ 
                          color: daysUntilDue < 0 ? '#e74c3c' : daysUntilDue <= 7 ? '#f39c12' : '#27ae60',
                          fontWeight: 'bold'
                        }}>
                          {daysUntilDue < 0 ? 'Overdue' : daysUntilDue <= 7 ? 'Due Soon' : 'Scheduled'}
                        </span>
                      </td>
                      <td>
                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Immunization History</h2>
        <div className="card">
          {immunizations.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Date Administered</th>
                  <th>Batch Number</th>
                  <th>Next Due Date</th>
                  <th>Administered By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {immunizations.map((imm) => (
                  <tr key={imm._id}>
                    <td>{imm.vaccineName}</td>
                    <td>{new Date(imm.dateAdministered).toLocaleDateString()}</td>
                    <td>{imm.batchNumber}</td>
                    <td>{imm.nextDueDate ? new Date(imm.nextDueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{imm.administeredBy?.name} ({imm.administeredBy?.role})</td>
                    <td>
                      <span style={{ 
                        color: imm.status === 'Completed' ? '#27ae60' : imm.status === 'Overdue' ? '#e74c3c' : '#f39c12'
                      }}>
                        {imm.status}
                      </span>
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
    </div>
  );
};

export default ParentChildProfile;