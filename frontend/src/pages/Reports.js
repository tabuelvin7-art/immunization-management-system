import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

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
      setCoverage(coverageRes.data.data);
      setOverdueList(overdueRes.data.data);
      setLowStock(lowStockRes.data.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
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
          <button onClick={() => window.print()} className="btn btn-primary">
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
  );
};

export default Reports;
