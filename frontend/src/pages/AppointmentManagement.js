import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      // Fetch filtered appointments for the table
      const { data } = await api.get('/staff/appointments', {
        params: filter !== 'All' ? { status: filter } : {}
      });
      setAppointments(data.data);

      // Always fetch all appointments for stats
      const allData = await api.get('/staff/appointments');
      setAllAppointments(allData.data.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/staff/appointments/${appointmentId}/status`, { status: newStatus });
      toast.success(`Appointment ${newStatus.toLowerCase()}`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Confirmed': return 'badge-success';
      case 'Completed': return 'badge-info';
      case 'Cancelled': return 'badge-danger';
      default: return '';
    }
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const appointmentDate = new Date(date);
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Appointment Management</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Filter by status:</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
              <button
                key={status}
                className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(status)}
                style={{ fontSize: '0.9rem' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card warning">
          <h3>Pending</h3>
          <p className="stat-number">
            {allAppointments.filter(a => a.status === 'Pending').length}
          </p>
        </div>
        <div className="stat-card success">
          <h3>Confirmed</h3>
          <p className="stat-number">
            {allAppointments.filter(a => a.status === 'Confirmed').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">
            {allAppointments.filter(a => a.status === 'Completed').length}
          </p>
        </div>
      </div>

      {appointments.length > 0 ? (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Parent</th>
                <th>Vaccine</th>
                <th>Preferred Date</th>
                <th>Days Until</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const daysUntil = getDaysUntil(appointment.preferredDate);
                return (
                  <tr key={appointment._id}>
                    <td>
                      <strong>{appointment.patient.name}</strong>
                      <br />
                      <small style={{ color: '#7f8c8d' }}>
                        {appointment.patient.gender}, {new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear()} years
                      </small>
                    </td>
                    <td>
                      {appointment.parentUser.name}
                      <br />
                      <small style={{ color: '#7f8c8d' }}>{appointment.parentUser.email}</small>
                    </td>
                    <td>{appointment.vaccineName}</td>
                    <td>{new Date(appointment.preferredDate).toLocaleDateString()}</td>
                    <td style={{ 
                      color: daysUntil < 0 ? '#e74c3c' : daysUntil <= 7 ? '#f39c12' : '#27ae60',
                      fontWeight: daysUntil <= 7 ? 'bold' : 'normal'
                    }}>
                      {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : 
                       daysUntil === 0 ? 'Today' : 
                       `${daysUntil} days`}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      {appointment.notes ? (
                        <small>{appointment.notes}</small>
                      ) : (
                        <small style={{ color: '#7f8c8d' }}>No notes</small>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        {appointment.status === 'Pending' && (
                          <>
                            <button
                              className="btn btn-success"
                              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                              onClick={() => handleStatusUpdate(appointment._id, 'Confirmed')}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                              onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'Confirmed' && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleStatusUpdate(appointment._id, 'Completed')}
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Appointments</h3>
          <p style={{ color: '#7f8c8d' }}>
            No {filter !== 'All' ? filter.toLowerCase() : ''} appointments found.
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
