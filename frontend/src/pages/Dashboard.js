import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import EnhancedCard from '../components/EnhancedCard';
import StatusBadge from '../components/StatusBadge';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p className="stat-number">{stats?.totalPatients || 0}</p>
          <Link to="/patients" className="stat-link">View All</Link>
        </div>

        <div className="stat-card">
          <h3>Total Immunizations</h3>
          <p className="stat-number">{stats?.totalImmunizations || 0}</p>
          <Link to="/immunizations" className="stat-link">View All</Link>
        </div>

        <div className="stat-card warning">
          <h3>Upcoming Immunizations</h3>
          <p className="stat-number">{stats?.upcomingImmunizations || 0}</p>
          <Link to="/immunizations" className="stat-link">View Details</Link>
        </div>

        <div className="stat-card danger">
          <h3>Overdue Immunizations</h3>
          <p className="stat-number">{stats?.overdueImmunizations || 0}</p>
          <Link to="/immunizations" className="stat-link">View Details</Link>
        </div>

        <div className="stat-card alert">
          <h3>Low Stock Vaccines</h3>
          <p className="stat-number">{stats?.lowStockVaccines || 0}</p>
          <Link to="/vaccines" className="stat-link">Manage Stock</Link>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Immunizations</h2>
        <EnhancedCard>
          {stats?.recentImmunizations?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Vaccine</th>
                  <th>Date</th>
                  <th>Administered By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentImmunizations.map((imm) => (
                  <tr key={imm._id}>
                    <td>
                      <strong>{imm.patient?.name}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#667eea', fontWeight: '600' }}>
                        {imm.vaccineName}
                      </span>
                    </td>
                    <td>{new Date(imm.dateAdministered).toLocaleDateString()}</td>
                    <td>
                      <div>
                        {imm.administeredBy?.name}
                        <br />
                        <small style={{ color: '#6c757d' }}>
                          {imm.administeredBy?.role}
                        </small>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status="completed" size="small">
                        ✓ Completed
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💉</div>
              <h3>No Recent Immunizations</h3>
              <p>Recent immunization records will appear here</p>
            </div>
          )}
        </EnhancedCard>
      </div>
    </div>
  );
};

export default Dashboard;
