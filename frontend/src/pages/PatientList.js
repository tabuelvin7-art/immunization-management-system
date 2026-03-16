import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');

  const fetchPatients = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (gender) params.gender = gender;
      
      const { data } = await api.get('/patients', { params });
      setPatients(data.data);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [search, gender]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        toast.error('Failed to delete patient');
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    const rows = patients.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${new Date(p.dateOfBirth).toLocaleDateString()}</td>
        <td>${p.gender}</td>
        <td>${p.contactNumber}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient List</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12pt; color: #000; margin: 0; padding: 1cm; }
            h1 { font-size: 18pt; text-align: center; margin-bottom: 0.25rem; }
            .subtitle { text-align: center; font-size: 10pt; color: #555; margin-bottom: 1.5rem; border-bottom: 2px solid #333; padding-bottom: 0.75rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th { background: #f0f0f0; border: 1px solid #333; padding: 0.4rem 0.6rem; text-align: left; font-size: 10pt; }
            td { border: 1px solid #ccc; padding: 0.4rem 0.6rem; font-size: 10pt; }
            tr { page-break-inside: avoid; }
            .empty { color: #777; font-style: italic; }
            @page { margin: 1cm; }
          </style>
        </head>
        <body>
          <h1>Patient List</h1>
          <p class="subtitle">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          ${patients.length > 0 ? `
            <table>
              <thead>
                <tr><th>Name</th><th>Date of Birth</th><th>Gender</th><th>Contact</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          ` : '<p class="empty">No patients found</p>'}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Patients</h1>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-secondary no-print">
            🖨️ Print List
          </button>
          <Link to="/patients/new" className="btn btn-primary">Add Patient</Link>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {patients.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td data-label="Name">{patient.name}</td>
                  <td data-label="Date of Birth">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                  <td data-label="Gender">{patient.gender}</td>
                  <td data-label="Contact">{patient.contactNumber}</td>
                  <td data-label="Actions">
                    <Link to={`/patients/${patient._id}`} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
                      View
                    </Link>
                    <Link to={`/patients/edit/${patient._id}`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(patient._id)} className="btn btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No patients found</p>
        )}
      </div>
    </div>
  );
};

export default PatientList;
