import type React from 'react'
import { useNavigate } from 'react-router-dom'

const AdminPage: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen p-8 font-poppins">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-[#1E3A8A] tracking-[-0.02em]">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">User Management</h2>
          <p className="text-[15px] leading-[22px] font-normal text-[#475569]">
            Manage user accounts and permissions
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">System Settings</h2>
          <p className="text-[15px] leading-[22px] font-normal text-[#475569]">
            Configure system parameters and settings
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">Audit Logs</h2>
          <p className="text-[15px] leading-[22px] font-normal text-[#475569]">
            View system activity and audit trails
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
