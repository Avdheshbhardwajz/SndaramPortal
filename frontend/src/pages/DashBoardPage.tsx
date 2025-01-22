import type React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
    }
  }, [navigate])

  return (
    <div className="min-h-screen p-8 font-poppins">
      <h1 className="text-2xl md:text-[28px] font-bold text-[#1E3A8A] mb-4 tracking-[-0.02em]">
        Dashboard
      </h1>
      <p className="text-[15px] leading-[22px] font-normal text-[#475569]">
        Welcome to your dashboard. You have successfully logged in.
      </p>
    </div>
  )
}

export default DashboardPage