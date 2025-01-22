import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "./Logo"
import { OTPInput } from "./OTPInput"
import { authService } from "../services/authService"
import { useOTPTimer } from "../hooks/useOTPTimer"
import type { LoginResponse } from "../types/auth"

interface OTPVerificationProps {
  email: string
  onVerify: (response: LoginResponse) => void
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onVerify }) => {
  const [otp, setOTP] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { timeLeft, startTimer } = useOTPTimer(90)
  const navigate = useNavigate()

  useEffect(() => {
    startTimer()
  }, [startTimer])

  const handleResendOTP = async () => {
    try {
      const response = await authService.sendOTP(email)
      if (response.success) {
        startTimer(90)
        setOTP(Array(6).fill(""))
        setError("")
      } else {
        setError(response.message)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to resend OTP. Please try again.")
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await authService.verifyOTP(email, otpString)
      if (response.success && response.token) {
        onVerify(response)
      } else {
        setError(response.message || "Verification failed")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to verify OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md px-4 sm:px-8 md:px-12 font-poppins">
      <Logo />
      <h1 className="text-2xl md:text-[28px] font-bold text-[#1E3A8A] mb-2 text-center tracking-[-0.02em]">
        OTP Verification
      </h1>
      <p className="text-[#475569] text-center text-[15px] leading-[22px] font-normal mb-8">
        Enter the OTP sent to your email address
      </p>

      <div className="w-full space-y-6">
        <div className="space-y-4">
          <OTPInput otp={otp} setOTP={setOTP} />
          {error && <p className="text-[14px] font-medium text-[#FF4444] text-center">{error}</p>}
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={isLoading}
          className="w-full bg-[#1E40AF] text-white py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50 text-[15px] font-medium transition-colors duration-200"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center space-y-2">
          <p className="text-[15px] leading-[22px] font-normal text-[#475569]">
            Time remaining: <span className="text-[#FF4444] font-medium">{timeLeft} Sec</span>
          </p>
          {timeLeft === 0 && (
            <button
              onClick={handleResendOTP}
              className="text-[#1E40AF] hover:text-blue-800 text-[15px] font-medium transition-colors duration-200"
            >
              Resend OTP
            </button>
          )}
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center text-[#1E3A8A] hover:text-blue-800 text-[15px] font-medium transition-colors duration-200 w-full"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Login
        </button>
      </div>
    </div>
  )
}
