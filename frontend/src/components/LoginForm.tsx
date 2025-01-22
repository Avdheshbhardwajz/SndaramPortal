import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "./Logo"
import { authService } from "../services/authService"

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await authService.sendOTP(email)
      if (response.success) {
        navigate("/verify-otp", { state: { email } })
      } else {
        setError(response.message)
      }
    } catch (err) {
      console.log(err)
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md px-4 sm:px-8 md:px-12 font-poppins">
      <Logo />
      <h1 className="text-2xl md:text-[28px] font-bold text-[#1E3A8A] mb-2 text-center tracking-[-0.02em]">
       Sundaram Mutual Fund
      </h1>
      <p className="text-[#475569] text-center text-[15px] leading-[22px] font-normal mb-8">
        Enter your email to let the system quickly identify your role.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div>
          <label htmlFor="email" className="block text-[15px] font-medium text-[#1E3A8A] mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-[15px] font-normal placeholder:text-[#94A3B8]"
            placeholder="Enter your email address"
          />
          {error && <p className="mt-2 text-[14px] font-medium text-[#FF4444]">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1E40AF] text-white py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50 text-[15px] font-medium transition-colors duration-200"
        >
          {isLoading ? "Sending..." : "Continue"}
        </button>
      </form>

      <p className="mt-auto text-[14px] font-normal text-[#64748B] pt-8 text-center">
        Secure login powered by Sundaram Finance
      </p>
    </div>
  )
}
