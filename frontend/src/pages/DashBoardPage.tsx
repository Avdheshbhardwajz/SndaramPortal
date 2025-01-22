import type React from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { DashboardCard } from '../components/DashboardCard'
import { DataManagementIcon, UserAdminIcon, SecurityIcon } from '../components/icons'
import AuditImage from '../assets/images/Audit.svg'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const firstName = localStorage.getItem('firstName') || ''
  const role = localStorage.getItem('userRole') || ''

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const dashboardCards = [
    {
      title: 'Data Management',
      description: 'Access and manage fund data with ease',
      icon: <DataManagementIcon />,
      onClick: () => navigate('/tables')
    },
    {
      title: 'User Administration',
      description: 'Manage user roles and permissions',
      icon: <UserAdminIcon />,
      onClick: () => console.log('User Administration clicked')
    },
    {
      title: 'Secure Operations',
      description: 'Enterprise-grade security for all operations',
      icon: <SecurityIcon />,
      onClick: () => console.log('Secure Operations clicked')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header firstName={firstName} role={role} onLogout={handleLogout} />
      
      {/* Main content with z-index to appear above the background image */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Hello, <span className="text-orange-500">{firstName}</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Access powerful tools and insights to manage your operations efficiently and effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => (
              <DashboardCard
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onClick={card.onClick}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Background image container fixed to bottom right */}
      <div className="fixed bottom-0 right-0 pointer-events-none select-none">
        <img 
          src={AuditImage} 
          alt="Audit Illustration" 
          className="w-[400px] h-auto opacity-30 max-w-[50vw]"
        />
      </div>
    </div>
  )
}

export default DashboardPage