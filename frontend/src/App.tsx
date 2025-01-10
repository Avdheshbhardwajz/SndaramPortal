import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import DashboardLayout from './pages/DashboardLayout';
import Checker from './pages/Checker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'maker' | 'checker';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  if (!token || userData.role?.toLowerCase() !== allowedRole) {
    // Clear storage if invalid and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/login" element={<Auth />} />

        {/* Admin Route */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Maker Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRole="maker">
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

        {/* Checker Dashboard Route */}
        <Route
          path="/checker/*"
          element={
            <ProtectedRoute allowedRole="checker">
              <Checker />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
