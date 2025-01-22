import type React from "react"
import { useLocation, Navigate, useSearchParams, useNavigate } from "react-router-dom"
import { OTPVerification } from "../components/OTPVerification"
import logo from "../assets/images/Login-Image.svg"
import type { LoginResponse } from "../types/auth"

const OTPVerificationPage: React.FC = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const email = location.state?.email || searchParams.get('email')
  const navigate = useNavigate()

  if (!email) {
    return <Navigate to="/" replace />
  }

  const handleOTPVerification = (response: LoginResponse) => {
    if (response.success && response.token && response.data) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('userRole', response.data.role.toLowerCase())
      localStorage.setItem('userEmail', response.data.email)
      localStorage.setItem('firstName', response.data.first_name)
      localStorage.setItem('lastName', response.data.last_name)
      
      // Redirect based on role
      const role = response.data.role.toLowerCase()
      switch (role) {
        case 'admin':
          navigate('/admin')
          break
        case 'maker':
          navigate('/dashboard')
          break
        case 'checker':
          navigate('/checker')
          break
        default:
          navigate('/')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="bg-white/80 rounded-[32px] shadow-xl overflow-hidden flex flex-col md:flex-row w-full max-w-[1120px] min-h-[640px] md:h-[640px]">
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <img
            src={logo}
            alt="Login"
            className="w-full  h-auto object-cover "
          />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center py-8 md:py-0">
          <OTPVerification email={email} onVerify={handleOTPVerification} />
        </div>
      </div>
    </div>
  )
}

export default OTPVerificationPage
