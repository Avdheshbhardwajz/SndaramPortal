import type React from 'react'
import { useState } from 'react'
import LogoFull from '../assets/images/Logo-Full.svg'
import NotificationIcon from '../assets/icons/notification-icon.svg'

interface HeaderProps {
  firstName: string
  role: string
  onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ firstName, role, onLogout }) => {
  const [showLogout, setShowLogout] = useState(false)
  
  const getInitial = (name: string) => name.charAt(0).toUpperCase()
  
  const getProfileColor = () => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-orange-100 text-orange-600'
    ]
    return colors[firstName.length % colors.length]
  }

  const handleLogoutClick = () => {
    setShowLogout(false)
    onLogout()
  }

  return (
    <header className="bg-white py-4 px-6 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center">
        <img src={LogoFull} alt="Sundaram Mutual" className="h-8" />
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative hover:opacity-80 transition-opacity">
          <img src={NotificationIcon} alt="Notifications" className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full ${getProfileColor()} flex items-center justify-center font-medium`}>
            {getInitial(firstName)}
          </div>
          
          <div className="flex items-center">
            <div className="mr-2">
              <div className="text-sm text-gray-500">{role}</div>
              <div className="text-sm font-medium">{firstName}</div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowLogout(!showLogout)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg 
                  className={`w-5 h-5 transition-transform ${showLogout ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showLogout && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
