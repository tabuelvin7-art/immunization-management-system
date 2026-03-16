import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggle = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      {isMenuOpen && <div className="navbar-backdrop" onClick={closeMenu} />}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-header">
            <Link to="/" className="navbar-logo" onClick={closeMenu}>
              <span className="logo-icon">💉</span>
              <span className="logo-text">Immunization System</span>
            </Link>
            <button
              className="navbar-toggle"
              onClick={handleToggle}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          <div className={`navbar-content ${isMenuOpen ? 'open' : ''}`}>
            <ul className="navbar-menu">
              <li><Link to="/" onClick={closeMenu}>Dashboard</Link></li>
              {user.role === 'Parent' ? (
                <>
                  <li><Link to="/parent/children" onClick={closeMenu}>My Children</Link></li>
                  <li className="nav-badge-item">
                    <Link to="/parent/notifications" onClick={closeMenu}>Notifications</Link>
                    <NotificationBadge />
                  </li>
                  <li><Link to="/parent/schedule" onClick={closeMenu}>Schedule</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/patients" onClick={closeMenu}>Patients</Link></li>
                  {['Doctor', 'Nurse', 'Admin'].includes(user.role) && (
                    <li><Link to="/immunizations" onClick={closeMenu}>Immunizations</Link></li>
                  )}
                  {['Admin', 'Nurse'].includes(user.role) && (
                    <li><Link to="/vaccines" onClick={closeMenu}>Vaccines</Link></li>
                  )}
                  {['Admin', 'Nurse', 'Doctor'].includes(user.role) && (
                    <>
                      <li><Link to="/appointments" onClick={closeMenu}>Appointments</Link></li>
                      <li><Link to="/verification-codes" onClick={closeMenu}>Parent Codes</Link></li>
                    </>
                  )}
                  <li><Link to="/reports" onClick={closeMenu}>Reports</Link></li>
                </>
              )}
            </ul>
            <div className="navbar-user">
              <Link to="/profile" className="user-profile-link" onClick={closeMenu}>
                {user.name} ({user.role})
              </Link>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
