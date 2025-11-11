import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { id } = useParams();

  useEffect(() => {
    fetchPatientData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPatientData = async () => {
    try {
      const [patientRes, immunizationsRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/immunizations?patientId=${id}`)
      ]);
      setPatient(patientRes.data.data);
      setImmunizations(immunizationsRes.data.data);
    } catch (error) {
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Patient Profile</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/patients/edit/${id}`} className="btn btn-primary">Edit Patient</Link>
          {!patient.parentUser && (
            <Link to={`/patients/${id}/generate-parent-code`} className="btn btn-success">
              Generate Parent Code
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <h2>{patient.name}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}
          </div>
          <div>
            <strong>Gender:</strong> {patient.gender}
          </div>
          <div>
            <strong>Contact:</strong> {patient.contactNumber}
          </div>
          {patient.email && (
            <div>
              <strong>Email:</strong> {patient.email}
            </div>
          )}
          {patient.address && (
            <div>
              <strong>Address:</strong> {patient.address}
            </div>
          )}
        </div>

        {patient.guardianName && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Guardian Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <strong>Name:</strong> {patient.guardianName}
              </div>
              <div>
                <strong>Contact:</strong> {patient.guardianContact}
              </div>
              <div>
                <strong>Relation:</strong> {patient.guardianRelation}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Immunization History</h2>
          {user && ['Doctor', 'Nurse'].includes(user.role) && (
            <Link to={`/immunizations/new?patientId=${id}`} className="btn btn-success">Add Immunization</Link>
          )}
        </div>

        <div className="card">
          {immunizations.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Date Administered</th>
                  <th>Batch Number</th>
                  <th>Next Due Date</th>
                  <th>Administered By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {immunizations.map((imm) => (
                  <tr key={imm._id}>
                    <td>{imm.vaccineName}</td>
                    <td>{new Date(imm.dateAdministered).toLocaleDateString()}</td>
                    <td>{imm.batchNumber}</td>
                    <td>{imm.nextDueDate ? new Date(imm.nextDueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{imm.administeredBy?.name}</td>
                    <td>{imm.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No immunization records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
