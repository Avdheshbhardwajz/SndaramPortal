import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from '@/components/admin/Layout';
import UserManagement from '@/components/admin/UserManagement';
import RowRequestManager from '@/components/admin/RowRequestManager';
import Configuration from '@/components/admin/Configuration';

const Admin: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || userData.role?.toLowerCase() !== 'admin') {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Layout>
      <Routes>
        <Route path="users" element={<UserManagement />} />
        <Route path="row-requests" element={<RowRequestManager />} />
        <Route path="configuration" element={<Configuration />} />
        <Route index element={<UserManagement />} />
      </Routes>
    </Layout>
  );
};

export default Admin;
