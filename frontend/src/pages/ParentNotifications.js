import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      case 'immunization':
        return notifications.filter(n => n.type.includes('immunization'));
      default:
        return notifications;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'upcoming_immunization': return '📅';
      case 'overdue_immunization': return '⚠️';
      case 'appointment_reminder': return '🏥';
      default: return '📢';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const filteredNotifications = getFilteredNotifications();

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <button onClick={markAllAsRead} className="btn btn-secondary">
          Mark All as Read
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="high">High Priority</option>
            <option value="immunization">Immunization Related</option>
          </select>
          <span style={{ color: '#7f8c8d' }}>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
        </div>
      </div>

      <div className="card">
        {filteredNotifications.length > 0 ? (
          <div>
            {filteredNotifications.map((notification) => (
              <div 
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ 
                        margin: 0, 
                        color: getPriorityColor(notification.priority),
                        fontWeight: notification.isRead ? 'normal' : 'bold'
                      }}>
                        {notification.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.8rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          backgroundColor: getPriorityColor(notification.priority),
                          color: 'white'
                        }}>
                          {notification.priority.toUpperCase()}
                        </span>
                        {!notification.isRead && (
                          <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            backgroundColor: '#3498db', 
                            borderRadius: '50%'
                          }}></div>
                        )}
                      </div>
                    </div>
                    
                    <p style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                      {notification.message}
                    </p>
                    
                    {notification.patient && (
                      <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        Child: {notification.patient.name}
                      </p>
                    )}
                    
                    {notification.dueDate && (
                      <p style={{ margin: '0 0 0.5rem 0', color: '#e74c3c', fontSize: '0.9rem' }}>
                        Due Date: {new Date(notification.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <small style={{ color: '#95a5a6' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                      <span style={{ 
                        fontSize: '0.8rem',
                        color: '#7f8c8d',
                        textTransform: 'capitalize'
                      }}>
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No Notifications</h3>
            <p style={{ color: '#7f8c8d' }}>
              {filter === 'all' 
                ? "You don't have any notifications yet." 
                : `No notifications match the selected filter: ${filter}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentNotifications;