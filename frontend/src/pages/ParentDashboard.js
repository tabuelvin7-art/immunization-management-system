import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import EnhancedCard from '../components/EnhancedCard';
import StatusBadge from '../components/StatusBadge';
import './Dashboard.css';

const ParentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, notificationsRes] = await Promise.all([
        api.get('/parent/dashboard'),
        api.get('/notifications')
      ]);
      setStats(statsRes.data.data);
      setNotifications(notificationsRes.data.data.slice(0, 5)); // Show only 5 recent notifications
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Parent Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>My Children</h3>
          <p className="stat-number">{stats?.totalChildren || 0}</p>
          <Link to="/parent/children" className="stat-link">View All</Link>
        </div>

        <div className="stat-card">
          <h3>Total Immunizations</h3>
          <p className="stat-number">{stats?.totalImmunizations || 0}</p>
          <Link to="/parent/immunizations" className="stat-link">View History</Link>
        </div>

        <div className="stat-card warning">
          <h3>Upcoming Immunizations</h3>
          <p className="stat-number">{stats?.upcomingImmunizations || 0}</p>
          <Link to="/parent/schedule" className="stat-link">View Schedule</Link>
        </div>

        <div className="stat-card danger">
          <h3>Overdue Immunizations</h3>
          <p className="stat-number">{stats?.overdueImmunizations || 0}</p>
          <Link to="/parent/schedule" className="stat-link">View Details</Link>
        </div>

        <div className="stat-card alert">
          <h3>Unread Notifications</h3>
          <p className="stat-number">{stats?.unreadNotifications || 0}</p>
          <Link to="/parent/notifications" className="stat-link">View All</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h2>My Children</h2>
          <EnhancedCard>
            {stats?.children?.length > 0 ? (
              <div>
                {stats.children.map((child, index) => (
                  <div key={child._id} style={{ 
                    padding: '1.5rem', 
                    borderBottom: index < stats.children.length - 1 ? '1px solid #f8f9fa' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.2rem' }}>
                          {child.name}
                        </h4>
                        <p style={{ color: '#6c757d', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                          🎂 Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                        </p>
                        <StatusBadge status="active" size="small">
                          {child.gender}
                        </StatusBadge>
                      </div>
                    </div>
                    <Link to={`/parent/children/${child._id}`} className="btn btn-primary">
                      👁️ View Profile
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👶</div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>No Children Linked</h3>
                <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
                  Link your children's accounts to track their immunizations
                </p>
                <Link to="/parent/link-child" className="btn btn-primary">
                  🔗 Link Child Account
                </Link>
              </div>
            )}
          </EnhancedCard>
        </div>

        <div>
          <h2>Recent Notifications</h2>
          <EnhancedCard>
            {notifications.length > 0 ? (
              <div>
                {notifications.map((notification, index) => (
                  <div 
                    key={notification._id} 
                    style={{ 
                      padding: '1.5rem', 
                      borderBottom: index < notifications.length - 1 ? '1px solid #f8f9fa' : 'none',
                      backgroundColor: notification.isRead ? 'transparent' : 'rgba(102, 126, 234, 0.05)',
                      cursor: notification.isRead ? 'default' : 'pointer',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      border: notification.priority === 'high' ? '2px solid rgba(255, 65, 108, 0.2)' : 'none'
                    }}
                    onClick={() => !notification.isRead && markNotificationAsRead(notification._id)}
                    onMouseEnter={(e) => {
                      if (!notification.isRead) {
                        e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!notification.isRead) {
                        e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: notification.priority === 'high' 
                          ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        minWidth: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {notification.type === 'upcoming_immunization' ? '📅' : 
                         notification.type === 'overdue_immunization' ? '⚠️' : '📢'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ 
                            margin: 0, 
                            color: notification.priority === 'high' ? '#e74c3c' : '#2c3e50',
                            fontWeight: notification.isRead ? '500' : '700'
                          }}>
                            {notification.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StatusBadge 
                              status={notification.priority === 'high' ? 'overdue' : 'scheduled'} 
                              size="small"
                            >
                              {notification.priority.toUpperCase()}
                            </StatusBadge>
                            {!notification.isRead && (
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                backgroundColor: '#667eea', 
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                              }}></div>
                            )}
                          </div>
                        </div>
                        <p style={{ margin: '0 0 0.75rem 0', color: '#6c757d', lineHeight: '1.5' }}>
                          {notification.message}
                        </p>
                        <small style={{ color: '#95a5a6', fontSize: '0.85rem' }}>
                          🕒 {new Date(notification.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '1.5rem 0 0 0', textAlign: 'center', borderTop: '1px solid #f8f9fa' }}>
                  <Link to="/parent/notifications" className="btn btn-secondary">
                    📋 View All Notifications
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔔</div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>No Notifications</h3>
                <p style={{ color: '#6c757d' }}>
                  You'll receive notifications about upcoming immunizations here
                </p>
              </div>
            )}
          </EnhancedCard>
        </div>
      </div>

      {stats?.recentImmunizations?.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2>Recent Immunizations</h2>
          <EnhancedCard>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Child</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {imm.patient?.name?.charAt(0)}
                        </div>
                        <strong>{imm.patient?.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        color: '#667eea', 
                        fontWeight: '600',
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: '8px'
                      }}>
                        💉 {imm.vaccineName}
                      </span>
                    </td>
                    <td>
                      <div>
                        {new Date(imm.dateAdministered).toLocaleDateString()}
                        <br />
                        <small style={{ color: '#6c757d' }}>
                          {new Date(imm.dateAdministered).toLocaleDateString('en-US', { weekday: 'short' })}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {imm.administeredBy?.name}
                        <br />
                        <StatusBadge status="active" size="small">
                          {imm.administeredBy?.role}
                        </StatusBadge>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status="completed" size="small">
                        ✅ Completed
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </EnhancedCard>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;