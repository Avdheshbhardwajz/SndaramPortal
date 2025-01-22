import type React from "react"
import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import OTPVerificationPage from "./pages/OTPVerificationPage"
import DashboardPage from "./pages/DashBoardPage"

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App

