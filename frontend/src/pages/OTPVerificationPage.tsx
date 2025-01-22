import type React from "react"
import { useLocation, Navigate, useSearchParams } from "react-router-dom"
import { OTPVerification } from "../components/OTPVerification"
import logo from "../assets/images/Login-Image.svg"

const OTPVerificationPage: React.FC = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const email = location.state?.email || searchParams.get('email')

  if (!email) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="bg-white/80 rounded-[32px] shadow-xl overflow-hidden flex flex-col md:flex-row w-full max-w-[1120px] min-h-[640px] md:h-[640px]">
        <div className="w-full md:w-1/2 relative h-48 md:h-auto">
          <img
            src={logo}
            alt="Financial Growth"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center py-8 md:py-0">
          <OTPVerification email={email} />
        </div>
      </div>
    </div>
  )
}

export default OTPVerificationPage
