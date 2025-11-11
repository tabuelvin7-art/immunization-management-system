import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const GenerateParentCode = () => {
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: ''
  });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { patientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPatient = async () => {
    try {
      const { data } = await api.get(`/patients/${patientId}`);
      setPatient(data.data);
      
      // Pre-fill guardian information if available
      if (data.data.guardianName) {
        setFormData(prev => ({
          ...prev,
          parentName: data.data.guardianName
        }));
      }
    } catch (error) {
      toast.error('Failed to load patient information');
      navigate('/patients');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/patients/generate-parent-code', {
        patientId,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail
      });

      setGeneratedCode(data.data);
      toast.success('Verification code generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate verification code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!patient) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Generate Parent Access Code</h1>
        <button onClick={() => navigate(`/patients/${patientId}`)} className="btn btn-secondary">
          Back to Patient
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h3>Patient Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <strong>Name:</strong> {patient.name}
            </div>
            <div>
              <strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}
            </div>
            <div>
              <strong>Gender:</strong> {patient.gender}
            </div>
            <div>
              <strong>Contact:</strong> {patient.contactNumber}
            </div>
          </div>

          {patient.parentUser && (
            <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '2rem' }}>
              <strong>⚠️ Notice:</strong> This patient is already linked to a parent account.
            </div>
          )}

          {!generatedCode ? (
            <form onSubmit={handleSubmit}>
              <h3>Parent Information</h3>
              <div className="form-group">
                <label>Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  placeholder="Enter parent or guardian's full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Parent Email Address *</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  placeholder="Enter parent's email address for account verification"
                  required
                />
                <small style={{ color: '#7f8c8d', display: 'block', marginTop: '0.25rem' }}>
                  This email must match the parent's registered account email
                </small>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading || patient.parentUser}>
                {loading ? 'Generating...' : 'Generate Verification Code'}
              </button>
            </form>
          ) : (
            <div>
              <h3 style={{ color: '#27ae60' }}>✅ Verification Code Generated</h3>
              
              <div style={{ backgroundColor: '#d4edda', padding: '1.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <strong>Patient ID:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <code style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', fontSize: '1.1rem' }}>
                        {generatedCode.patientId}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(generatedCode.patientId)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <strong>Verification Code:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <code style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                        {generatedCode.code}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(generatedCode.code)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <strong>Parent Name:</strong> {generatedCode.parentName}
                  </div>
                  <div>
                    <strong>Parent Email:</strong> {generatedCode.parentEmail}
                  </div>
                  <div>
                    <strong>Expires:</strong> {new Date(generatedCode.expiresAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#cce5ff', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <h4>Instructions for Parent:</h4>
                <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                  <li>Create a parent account at the registration page (select "Parent" role)</li>
                  <li>Use the email address: <strong>{generatedCode.parentEmail}</strong></li>
                  <li>After logging in, go to "Link Child" in the menu</li>
                  <li>Enter the Patient ID: <strong>{generatedCode.patientId}</strong></li>
                  <li>Enter the Verification Code: <strong>{generatedCode.code}</strong></li>
                  <li>The code expires on: <strong>{new Date(generatedCode.expiresAt).toLocaleString()}</strong></li>
                </ol>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setGeneratedCode(null)} 
                  className="btn btn-secondary"
                >
                  Generate New Code
                </button>
                <button 
                  onClick={() => navigate(`/patients/${patientId}`)} 
                  className="btn btn-primary"
                >
                  Back to Patient Profile
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Important Notes</h3>
          <ul style={{ color: '#7f8c8d', paddingLeft: '1.5rem' }}>
            <li>Verification codes expire after 48 hours</li>
            <li>Only one active code per patient at a time</li>
            <li>Parent must use the exact email address provided</li>
            <li>Each child requires a separate verification process</li>
            <li>Codes can only be used once</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GenerateParentCode;