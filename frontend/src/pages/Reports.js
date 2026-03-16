import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Reports.css';

const Reports = () => {
  const [coverage, setCoverage] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [coverageRes, overdueRes, lowStockRes] = await Promise.all([
        api.get('/dashboard/coverage'),
        api.get('/immunizations/overdue'),
        api.get('/vaccines/low-stock')
      ]);
      setCoverage(coverageRes.data.data || []);
      setOverdueList(overdueRes.data.data || []);
      setLowStock(lowStockRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    const coverageRows = coverage.map(item => `
      <tr><td>${item._id}</td><td>${item.count}</td></tr>
    `).join('');

    const overdueRows = overdueList.map(item => `
      <tr>
        <td>${item.patient?.name || '-'}</td>
        <td>${item.patient?.contactNumber || '-'}</td>
        <td>${item.vaccineName}</td>
        <td>${new Date(item.nextDueDate).toLocaleDateString()}</td>
      </tr>
    `).join('');

    const lowStockRows = lowStock.map(v => `
      <tr>
        <td>${v.name}</td>
        <td>${v.quantity}</td>
        <td>${v.minStockLevel}</td>
        <td>${new Date(v.expiryDate).toLocaleDateString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Immunization Reports</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12pt; color: #000; margin: 0; padding: 1cm; }
            h1 { font-size: 18pt; text-align: center; margin-bottom: 0.25rem; }
            .subtitle { text-align: center; font-size: 10pt; color: #555; margin-bottom: 1.5rem; border-bottom: 2px solid #333; padding-bottom: 0.75rem; }
            h2 { font-size: 13pt; margin: 1.5rem 0 0.5rem; border-bottom: 1px solid #667eea; padding-bottom: 0.3rem; color: #2c3e50; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
            th { background: #f0f0f0; border: 1px solid #333; padding: 0.4rem 0.6rem; text-align: left; font-size: 10pt; }
            td { border: 1px solid #ccc; padding: 0.4rem 0.6rem; font-size: 10pt; }
            tr { page-break-inside: avoid; }
            .empty { color: #777; font-style: italic; }
            @page { margin: 1cm; }
          </style>
        </head>
        <body>
          <h1>Immunization System - Reports</h1>
          <p class="subtitle">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>

          <h2>Immunization Coverage</h2>
          ${coverage.length > 0 ? `
            <table>
              <thead><tr><th>Vaccine Name</th><th>Total Administered</th></tr></thead>
              <tbody>${coverageRows}</tbody>
            </table>
          ` : '<p class="empty">No data available</p>'}

          <h2>Overdue Immunizations</h2>
          ${overdueList.length > 0 ? `
            <table>
              <thead><tr><th>Patient</th><th>Contact</th><th>Vaccine</th><th>Due Date</th></tr></thead>
              <tbody>${overdueRows}</tbody>
            </table>
          ` : '<p class="empty">No overdue immunizations</p>'}

          <h2>Low Stock Vaccines</h2>
          ${lowStock.length > 0 ? `
            <table>
              <thead><tr><th>Vaccine Name</th><th>Current Quantity</th><th>Min Stock Level</th><th>Expiry Date</th></tr></thead>
              <tbody>${lowStockRows}</tbody>
            </table>
          ` : '<p class="empty">All vaccines are adequately stocked</p>'}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="reports-page">
      <div className="print-header">
        <h1>Immunization System - Reports</h1>
        <p>Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div className="page-header no-print">
        <h1>Reports</h1>
        <div className="report-actions">
          <button onClick={handlePrint} className="btn btn-primary">
            🖨️ Print Reports
          </button>
          <button onClick={fetchReports} className="btn btn-secondary">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      <div className="card report-section" style={{ marginBottom: '2rem' }}>
        <h2>📊 Immunization Coverage Report</h2>
        {coverage.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Total Administered</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((item, index) => (
                <tr key={index}>
                  <td>{item._id}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available</p>
        )}
      </div>

      <div className="card report-section" style={{ marginBottom: '2rem' }}>
        <h2>⚠️ Overdue Immunizations Report</h2>
        {overdueList.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>Vaccine</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {overdueList.map((item) => (
                <tr key={item._id}>
                  <td>{item.patient?.name}</td>
                  <td>{item.patient?.contactNumber}</td>
                  <td>{item.vaccineName}</td>
                  <td>{new Date(item.nextDueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No overdue immunizations</p>
        )}
      </div>

      <div className="card report-section">
        <h2>📦 Low Stock Vaccines Report</h2>
        {lowStock.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Current Quantity</th>
                <th>Min Stock Level</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((vaccine) => (
                <tr key={vaccine._id}>
                  <td>{vaccine.name}</td>
                  <td>{vaccine.quantity}</td>
                  <td>{vaccine.minStockLevel}</td>
                  <td>{new Date(vaccine.expiryDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>All vaccines are adequately stocked</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
