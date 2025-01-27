import type React from "react"
import { Routes, Route } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoginPage from "./pages/LoginPage"
import OTPVerificationPage from "./pages/OTPVerificationPage"
import DashboardPage from "./pages/DashBoardPage"
import AdminPage from "./pages/AdminPage"
import CheckerPage from "./pages/CheckerPage"
import MakerPage from "./pages/DashBoardPage"
import TablesPage from "./pages/TablesPage"
import ProtectedRoute from "./components/ProtectedRoute"

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        
        {/* Protected Maker Route */}
        <Route
          path="/maker"
          element={
            <ProtectedRoute allowedRoles={['maker']}>
              <MakerPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Checker Route */}
        <Route
          path="/checker"
          element={
            <ProtectedRoute allowedRoles={['checker']}>
              <CheckerPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['maker', 'checker', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Tables Route */}
        <Route
          path="/tables"
          element={
            <ProtectedRoute allowedRoles={['maker', 'checker', 'admin']}>
              <TablesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App
