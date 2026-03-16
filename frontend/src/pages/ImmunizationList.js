import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const ImmunizationList = () => {
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchImmunizations();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchImmunizations = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/immunizations', { params });
      setImmunizations(data.data);
    } catch (error) {
      toast.error('Failed to load immunizations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/immunizations/${id}`);
        toast.success('Record deleted successfully');
        fetchImmunizations();
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    const statusColor = (status) => {
      if (status === 'Completed') return '#27ae60';
      if (status === 'Overdue') return '#e74c3c';
      return '#f39c12';
    };

    const rows = immunizations.map(imm => `
      <tr>
        <td>${imm.patient?.name || '-'}</td>
        <td>${imm.vaccineName}</td>
        <td>${new Date(imm.dateAdministered).toLocaleDateString()}</td>
        <td>${imm.nextDueDate ? new Date(imm.nextDueDate).toLocaleDateString() : 'N/A'}</td>
        <td style="color:${statusColor(imm.status)}; font-weight:bold">${imm.status}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Immunization Records</title>
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
          <h1>Immunization Records</h1>
          <p class="subtitle">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          ${immunizations.length > 0 ? `
            <table>
              <thead>
                <tr><th>Patient</th><th>Vaccine</th><th>Date Administered</th><th>Next Due Date</th><th>Status</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          ` : '<p class="empty">No immunization records found</p>'}
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
        <h1>Immunization Records</h1>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-secondary no-print">
            🖨️ Print Records
          </button>
          {user && ['Doctor', 'Nurse'].includes(user.role) && (
            <Link to="/immunizations/new" className="btn btn-primary">Add Record</Link>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Due">Due</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {immunizations.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Vaccine</th>
                <th>Date Administered</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {immunizations.map((imm) => (
                <tr key={imm._id}>
                  <td data-label="Patient">
                    <Link to={`/patients/${imm.patient._id}`}>{imm.patient.name}</Link>
                  </td>
                  <td data-label="Vaccine">{imm.vaccineName}</td>
                  <td data-label="Date Administered">{new Date(imm.dateAdministered).toLocaleDateString()}</td>
                  <td data-label="Next Due Date">{imm.nextDueDate ? new Date(imm.nextDueDate).toLocaleDateString() : 'N/A'}</td>
                  <td data-label="Status">{imm.status}</td>
                  <td data-label="Actions">
                    {user && ['Doctor', 'Nurse'].includes(user.role) && (
                      <>
                        <Link to={`/immunizations/edit/${imm._id}`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(imm._id)} className="btn btn-danger">
                          Delete
                        </button>
                      </>
                    )}
                    {user && !['Doctor', 'Nurse'].includes(user.role) && (
                      <span style={{ color: '#6c757d', fontStyle: 'italic' }}>View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No immunization records found</p>
        )}
      </div>
    </div>
  );
};

export default ImmunizationList;
