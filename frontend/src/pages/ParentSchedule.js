import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import AppointmentModal from '../components/AppointmentModal';

const ParentSchedule = () => {
  const [children, setChildren] = useState([]);
  const [upcomingImmunizations, setUpcomingImmunizations] = useState([]);
  const [overdueImmunizations, setOverdueImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImmunization, setSelectedImmunization] = useState(null);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const [childrenRes] = await Promise.all([
        api.get('/parent/children')
      ]);
      
      const childrenData = childrenRes.data.data;
      setChildren(childrenData);

      // Fetch immunization data for all children
      const allUpcoming = [];
      const allOverdue = [];

      for (const child of childrenData) {
        try {
          const [upcomingRes, immunizationsRes] = await Promise.all([
            api.get(`/parent/children/${child._id}/upcoming`),
            api.get(`/parent/children/${child._id}/immunizations`)
          ]);

          const upcoming = upcomingRes.data.data.map(imm => ({ ...imm, childName: child.name, childId: child._id }));
          const overdue = immunizationsRes.data.data
            .filter(imm => imm.nextDueDate && new Date(imm.nextDueDate) < new Date() && imm.status === 'Overdue')
            .map(imm => ({ ...imm, childName: child.name, childId: child._id }));

          allUpcoming.push(...upcoming);
          allOverdue.push(...overdue);
        } catch (error) {
          console.error(`Error fetching data for child ${child.name}:`, error);
        }
      }

      setUpcomingImmunizations(allUpcoming.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)));
      setOverdueImmunizations(allOverdue.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)));
    } catch (error) {
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredImmunizations = (immunizations) => {
    if (selectedChild === 'all') return immunizations;
    return immunizations.filter(imm => imm.childId === selectedChild);
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (daysUntilDue) => {
    if (daysUntilDue < 0) return '#e74c3c'; // Overdue - red
    if (daysUntilDue <= 7) return '#f39c12'; // Due soon - orange
    if (daysUntilDue <= 30) return '#f1c40f'; // Due this month - yellow
    return '#27ae60'; // Future - green
  };

  const getStatusText = (daysUntilDue) => {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue <= 7) return `Due in ${daysUntilDue} days`;
    return `Due in ${daysUntilDue} days`;
  };

  const handleScheduleClick = (immunization) => {
    setSelectedImmunization(immunization);
    setModalOpen(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  const filteredUpcoming = getFilteredImmunizations(upcomingImmunizations);
  const filteredOverdue = getFilteredImmunizations(overdueImmunizations);

  return (
    <div>
      {selectedImmunization && (
        <AppointmentModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          immunization={selectedImmunization}
          patientId={selectedImmunization.childId}
          patientName={selectedImmunization.childName}
        />
      )}
      <div className="page-header">
        <h1>Immunization Schedule</h1>
        <Link to="/parent/children" className="btn btn-secondary">Back to Children</Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Filter by child:</label>
          <select 
            value={selectedChild} 
            onChange={(e) => setSelectedChild(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All Children</option>
            {children.map(child => (
              <option key={child._id} value={child._id}>{child.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <h3>Total Upcoming</h3>
          <p className="stat-number">{filteredUpcoming.length}</p>
        </div>
        <div className="stat-card danger">
          <h3>Overdue</h3>
          <p className="stat-number">{filteredOverdue.length}</p>
        </div>
        <div className="stat-card warning">
          <h3>Due This Week</h3>
          <p className="stat-number">
            {filteredUpcoming.filter(imm => getDaysUntilDue(imm.nextDueDate) <= 7).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Due This Month</h3>
          <p className="stat-number">
            {filteredUpcoming.filter(imm => getDaysUntilDue(imm.nextDueDate) <= 30).length}
          </p>
        </div>
      </div>

      {/* Overdue Immunizations */}
      {filteredOverdue.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#e74c3c' }}>⚠️ Overdue Immunizations</h2>
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Vaccine</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOverdue.map((imm) => {
                  const daysOverdue = Math.abs(getDaysUntilDue(imm.nextDueDate));
                  return (
                    <tr key={imm._id} style={{ backgroundColor: '#fadbd8' }}>
                      <td>
                        <Link to={`/parent/children/${imm.childId}`} style={{ fontWeight: 'bold' }}>
                          {imm.childName}
                        </Link>
                      </td>
                      <td>{imm.vaccineName}</td>
                      <td>{new Date(imm.nextDueDate).toLocaleDateString()}</td>
                      <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        {daysOverdue} days
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger" 
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleScheduleClick(imm)}
                        >
                          Schedule Now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Immunizations */}
      <div>
        <h2>📅 Upcoming Immunizations</h2>
        <div className="card">
          {filteredUpcoming.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Vaccine</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcoming.map((imm) => {
                  const daysUntilDue = getDaysUntilDue(imm.nextDueDate);
                  return (
                    <tr key={imm._id}>
                      <td>
                        <Link to={`/parent/children/${imm.childId}`} style={{ fontWeight: 'bold' }}>
                          {imm.childName}
                        </Link>
                      </td>
                      <td>{imm.vaccineName}</td>
                      <td>{new Date(imm.nextDueDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ 
                          color: getStatusColor(daysUntilDue),
                          fontWeight: 'bold'
                        }}>
                          {getStatusText(daysUntilDue)}
                        </span>
                      </td>
                      <td>
                        {daysUntilDue <= 30 ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => handleScheduleClick(imm)}
                          >
                            Schedule Appointment
                          </button>
                        ) : (
                          <span style={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                            Not yet due
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3>No Upcoming Immunizations</h3>
              <p style={{ color: '#7f8c8d' }}>
                {selectedChild === 'all' 
                  ? "All your children are up to date with their immunizations!" 
                  : "This child is up to date with their immunizations!"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/parent/notifications" className="btn btn-secondary">
            View All Notifications
          </Link>
          <Link to="/parent/children" className="btn btn-secondary">
            Manage Children
          </Link>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Print Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentSchedule;