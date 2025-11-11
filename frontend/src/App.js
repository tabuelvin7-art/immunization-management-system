import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientList from './pages/PatientList';
import PatientProfile from './pages/PatientProfile';
import PatientForm from './pages/PatientForm';
import ImmunizationList from './pages/ImmunizationList';
import ImmunizationForm from './pages/ImmunizationForm';
import VaccineList from './pages/VaccineList';
import VaccineForm from './pages/VaccineForm';
import Reports from './pages/Reports';
import ParentChildren from './pages/ParentChildren';
import ParentNotifications from './pages/ParentNotifications';
import ParentChildProfile from './pages/ParentChildProfile';
import ParentSchedule from './pages/ParentSchedule';
import LinkChild from './pages/LinkChild';
import GenerateParentCode from './pages/GenerateParentCode';
import VerificationCodes from './pages/VerificationCodes';
import RoleGuard from './components/RoleGuard';
import AccessDenied from './components/AccessDenied';
import './App.css';
import DashboardRouter from './components/DashboardRouter';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
              
              {/* Healthcare Staff Routes */}
              <Route path="/patients" element={<PrivateRoute><PatientList /></PrivateRoute>} />
              <Route path="/patients/new" element={<PrivateRoute><PatientForm /></PrivateRoute>} />
              <Route path="/patients/edit/:id" element={<PrivateRoute><PatientForm /></PrivateRoute>} />
              <Route path="/patients/:id" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
              <Route path="/immunizations" element={<PrivateRoute><ImmunizationList /></PrivateRoute>} />
              <Route path="/immunizations/new" element={<PrivateRoute><RoleGuard allowedRoles={['Doctor', 'Nurse']} fallback={<AccessDenied message="Only doctors and nurses are authorized to administer vaccines." allowedRoles={['Doctor', 'Nurse']} />}><ImmunizationForm /></RoleGuard></PrivateRoute>} />
              <Route path="/immunizations/edit/:id" element={<PrivateRoute><RoleGuard allowedRoles={['Doctor', 'Nurse']} fallback={<AccessDenied message="Only doctors and nurses are authorized to edit immunization records." allowedRoles={['Doctor', 'Nurse']} />}><ImmunizationForm /></RoleGuard></PrivateRoute>} />
              <Route path="/vaccines" element={<PrivateRoute><VaccineList /></PrivateRoute>} />
              <Route path="/vaccines/new" element={<PrivateRoute><VaccineForm /></PrivateRoute>} />
              <Route path="/vaccines/edit/:id" element={<PrivateRoute><VaccineForm /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="/patients/:patientId/generate-parent-code" element={<PrivateRoute><GenerateParentCode /></PrivateRoute>} />
              <Route path="/verification-codes" element={<PrivateRoute><VerificationCodes /></PrivateRoute>} />
              
              {/* Parent Routes */}
              <Route path="/parent/children" element={<PrivateRoute><ParentChildren /></PrivateRoute>} />
              <Route path="/parent/children/:id" element={<PrivateRoute><ParentChildProfile /></PrivateRoute>} />
              <Route path="/parent/notifications" element={<PrivateRoute><ParentNotifications /></PrivateRoute>} />
              <Route path="/parent/schedule" element={<PrivateRoute><ParentSchedule /></PrivateRoute>} />
              <Route path="/parent/link-child" element={<PrivateRoute><LinkChild /></PrivateRoute>} />
            </Routes>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
