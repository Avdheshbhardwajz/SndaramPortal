import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from "../components/Header"
import { RowRequestManager } from "../components/RowRequestManager"
import Configuration from "../components/Configuration"
import UserManagement from "../components/UserManagement"

interface Tab {
  id: string
  label: string
}

const tabs: Tab[] = [
  { id: 'row-requests', label: 'Row Requests' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'user-management', label: 'User Management' },
]

const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('row-requests')
  const [firstName, setFirstName] = useState<string>('')
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    const storedFirstName = localStorage.getItem('firstName')
    const storedRole = localStorage.getItem('userRole')
    
    if (!storedFirstName || !storedRole) {
      navigate('/')
      return
    }

    setFirstName(storedFirstName)
    setRole(storedRole)
  }, [navigate])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (!firstName || !role) {
    return null // or a loading spinner
  }

  return (
    <div className="min-h-screen ">
      <Header firstName={firstName} role={role} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-4">
        <div className="">
          <h1 className="text-2xl font-semibold mb-1">
            Hello, <span className="text-orange-500">{firstName}</span>
          </h1>
          <p className="text-gray-600">Admin dashboard</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'row-requests' && <RowRequestManager />}
          {activeTab === 'configuration' && <Configuration />}
          {activeTab === 'user-management' && <UserManagement />}
        </div>
      </main>
    </div>
  )
}

export default AdminPage
