import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import ParentDashboard from '../pages/ParentDashboard';

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'Parent') {
    return <ParentDashboard />;
  }

  return <Dashboard />;
};

export default DashboardRouter;