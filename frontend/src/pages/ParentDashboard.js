import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchDashboardData = async () => {
      try {
        const [statsRes, notificationsRes] = await Promise.all([
          api.get('/parent/dashboard'),
          api.get('/notifications')
        ]);
        
        if (mounted) {
          setStats(statsRes.data.data);
          setNotifications(notificationsRes.data.data.slice(0, 5));
          setError(false);
        }
      } catch (error) {
        if (mounted) {
          console.error('Dashboard error:', error);
          setError(true);
          toast.error('Failed to load dashboard data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();
    
    return () => {
      mounted = false;
    };
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Mark notification error:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Unable to load dashboard</h2>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    );
  }

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

      <div className="parent-dashboard-grid">
        <div>
          <h2>My Children</h2>
          <EnhancedCard>
            {stats?.children?.length > 0 ? (
              <div>
                {stats.children.slice(0, 10).map((child, index) => (
                  <div key={child._id} className="child-card" style={{ 
                    padding: '1.5rem', 
                    borderBottom: index < Math.min(stats.children.length, 10) - 1 ? '1px solid #f8f9fa' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '12px'
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="child-avatar">
                        {child.name?.charAt(0) || '?'}
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
                    className={`notification-card ${!notification.isRead ? 'unread' : ''} ${notification.priority === 'high' ? 'high-priority' : ''}`}
                    style={{ 
                      padding: '1.5rem', 
                      borderBottom: index < notifications.length - 1 ? '1px solid #f8f9fa' : 'none',
                      borderRadius: '12px'
                    }}
                    onClick={() => !notification.isRead && markNotificationAsRead(notification._id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div className={`notification-icon ${notification.priority === 'high' ? 'high' : ''}`}>
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
        <div style={{ marginTop: '3rem' }} className="recent-immunizations-section">
          <h2>Recent Immunizations</h2>
          <EnhancedCard>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Vaccine</th>
                  <th>Date</th>
                  <th className="hide-mobile">Administered By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentImmunizations.slice(0, 5).map((imm) => (
                  <tr key={imm._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="table-avatar">
                          {imm.patient?.name?.charAt(0) || '?'}
                        </div>
                        <strong>{imm.patient?.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="vaccine-badge">
                        💉 {imm.vaccineName}
                      </span>
                    </td>
                    <td>
                      <div>
                        {new Date(imm.dateAdministered).toLocaleDateString()}
                        <br className="hide-mobile" />
                        <small style={{ color: '#6c757d' }} className="hide-mobile">
                          {new Date(imm.dateAdministered).toLocaleDateString('en-US', { weekday: 'short' })}
                        </small>
                      </div>
                    </td>
                    <td className="hide-mobile">
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