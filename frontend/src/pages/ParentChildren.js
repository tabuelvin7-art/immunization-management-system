import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ParentChildren = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const { data } = await api.get('/parent/children');
      setChildren(data.data);
    } catch (error) {
      toast.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Children</h1>
        <Link to="/parent/link-child" className="btn btn-primary">Link Child</Link>
      </div>

      {children.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {children.map((child) => (
            <div key={child._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{child.name}</h3>
                  <p style={{ color: '#7f8c8d', margin: '0.25rem 0' }}>
                    Age: {calculateAge(child.dateOfBirth)} years old
                  </p>
                  <p style={{ color: '#7f8c8d', margin: '0.25rem 0' }}>
                    Gender: {child.gender}
                  </p>
                  <p style={{ color: '#7f8c8d', margin: '0.25rem 0' }}>
                    DOB: {new Date(child.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link 
                  to={`/parent/children/${child._id}`} 
                  className="btn btn-primary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  View Profile
                </Link>
                <Link 
                  to={`/parent/children/${child._id}/immunizations`} 
                  className="btn btn-secondary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Immunizations
                </Link>
                <Link 
                  to={`/parent/children/${child._id}/schedule`} 
                  className="btn btn-success"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Schedule
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Children Linked</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
            You haven't linked any children to your account yet. 
            Contact your healthcare provider to get a verification code to link your child's records.
          </p>
          <Link to="/parent/link-child" className="btn btn-primary">Link Child Account</Link>
        </div>
      )}
    </div>
  );
};

export default ParentChildren;