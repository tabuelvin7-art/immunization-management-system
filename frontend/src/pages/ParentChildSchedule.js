import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import AppointmentModal from '../components/AppointmentModal';

const ParentChildSchedule = () => {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImmunization, setSelectedImmunization] = useState(null);

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
      
      const immunizations = immunizationsRes.data.data;
      const today = new Date();
      
      const upcomingList = immunizations.filter(imm => 
        imm.nextDueDate && new Date(imm.nextDueDate) >= today
      );
      
      const overdueList = immunizations.filter(imm => 
        imm.nextDueDate && new Date(imm.nextDueDate) < today && imm.status !== 'Completed'
      );
      
      setUpcoming(upcomingList.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)));
      setOverdue(overdueList.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)));
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleScheduleClick = (immunization) => {
    setSelectedImmunization(immunization);
    setModalOpen(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      {selectedImmunization && (
        <AppointmentModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          immunization={selectedImmunization}
          patientId={id}
          patientName={child?.name}
        />
      )}
      <div className="page-header">
        <h1>{child?.name}'s Immunization Schedule</h1>
        <Link to="/parent/children" className="btn btn-secondary">Back to Children</Link>
      </div>

      {overdue.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <h2 style={{ color: '#e74c3c' }}>⚠️ Overdue Immunizations</h2>
          <table>
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((imm) => {
                const daysOverdue = Math.abs(getDaysUntilDue(imm.nextDueDate));
                return (
                  <tr key={imm._id}>
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
      )}

      <div className="card">
        <h2>📅 Upcoming Immunizations</h2>
        {upcoming.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Due Date</th>
                <th>Days Until Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((imm) => {
                const daysUntilDue = getDaysUntilDue(imm.nextDueDate);
                return (
                  <tr key={imm._id}>
                    <td>{imm.vaccineName}</td>
                    <td>{new Date(imm.nextDueDate).toLocaleDateString()}</td>
                    <td style={{ 
                      color: daysUntilDue <= 7 ? '#e74c3c' : daysUntilDue <= 30 ? '#f39c12' : '#27ae60',
                      fontWeight: daysUntilDue <= 30 ? 'bold' : 'normal'
                    }}>
                      {daysUntilDue} days
                    </td>
                    <td>
                      {daysUntilDue <= 30 && (
                        <button 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleScheduleClick(imm)}
                        >
                          Schedule Appointment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '2rem' }}>
            No upcoming immunizations scheduled.
          </p>
        )}
      </div>
    </div>
  );
};

export default ParentChildSchedule;
