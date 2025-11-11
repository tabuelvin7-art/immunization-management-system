import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Immunization System
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/">Dashboard</Link></li>
          {user.role === 'Parent' ? (
            <>
              <li><Link to="/parent/children">My Children</Link></li>
              <li style={{ position: 'relative' }}>
                <Link to="/parent/notifications">Notifications</Link>
                <NotificationBadge />
              </li>
              <li><Link to="/parent/schedule">Schedule</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/patients">Patients</Link></li>
              {['Doctor', 'Nurse', 'Admin'].includes(user.role) && (
                <li><Link to="/immunizations">Immunizations</Link></li>
              )}
              {['Admin', 'Nurse'].includes(user.role) && (
                <li><Link to="/vaccines">Vaccines</Link></li>
              )}
              {['Admin', 'Nurse', 'Doctor'].includes(user.role) && (
                <li><Link to="/verification-codes">Parent Codes</Link></li>
              )}
              <li><Link to="/reports">Reports</Link></li>
            </>
          )}
        </ul>
        <div className="navbar-user">
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
