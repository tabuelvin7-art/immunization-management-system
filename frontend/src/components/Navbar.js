import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle body class when menu opens/closes
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!user) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('navbar') && e.target.classList.contains('menu-open')) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`} onClick={handleBackdropClick}>
      <div className="navbar-container">
        <div className="navbar-header">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <span className="logo-icon">💉</span>
            <span className="logo-text">Immunization System</span>
          </Link>
          <button 
            className="navbar-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                <li style={{ position: 'relative' }}>
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
            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }} onClick={closeMenu}>
              <span style={{ cursor: 'pointer', transition: 'opacity 0.3s' }} 
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}>
                {user.name} ({user.role})
              </span>
            </Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
