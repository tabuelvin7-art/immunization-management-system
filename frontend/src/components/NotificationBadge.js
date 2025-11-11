import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role === 'Parent') {
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  if (!user || user.role !== 'Parent' || unreadCount === 0) {
    return null;
  }

  return (
    <span style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#e74c3c',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: 'bold'
    }}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default NotificationBadge;