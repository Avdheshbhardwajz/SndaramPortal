import React, { useState } from 'react'
import LogoFull from '../assets/images/Logo-Full.svg'
import { Avatar } from './ui/Avatar'
import { IconButton } from './ui/IconButton'
import { Badge } from './ui/Badge'
import { colors } from '../constants/colors'
import { sizes } from '../constants/sizes'

interface HeaderProps {
  firstName: string
  role: string
  onLogout: () => void
}

const NotificationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M16.0705 7.39016C16.0705 8.80616 16.4865 9.61216 17.2335 10.4232C17.8455 11.0772 18.0005 11.9312 18.0005 12.8792C18.0005 13.8272 17.6255 14.7042 16.9105 15.3362C16.0705 16.0772 14.9815 16.5072 13.8145 16.5552C12.2515 16.6292 10.6885 16.6772 9.09849 16.6772C7.50849 16.6772 5.94549 16.6552 4.38249 16.5552C3.21549 16.5072 2.12649 16.0772 1.28649 15.3362C0.571488 14.7042 0.196488 13.8272 0.196488 12.8792C0.196488 11.9312 0.351488 11.0772 0.963488 10.4232C1.73249 9.61216 2.12649 8.80616 2.12649 7.39016V7.12216C2.12649 5.51816 2.54849 4.34816 3.41649 3.26216C4.68649 1.68616 6.74049 0.752158 8.98449 0.752158H9.21249C11.5025 0.752158 13.6025 1.70816 14.8725 3.32816C15.7185 4.39216 16.0935 5.54016 16.0935 7.12216L16.0705 7.39016ZM6.27349 18.5232C6.27349 18.0452 6.67549 17.7292 7.13149 17.7292H11.0655C11.5215 17.7292 11.9235 18.0452 11.9235 18.5232C11.9235 19.0012 11.5215 19.3172 11.0655 19.3172H7.13149C6.67549 19.3172 6.27349 19.0012 6.27349 18.5232Z" fill="currentColor"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    fill="none"
  >
    <path 
      d="M5 7.5L10 12.5L15 7.5" 
      stroke="currentColor" 
      strokeWidth="1.67" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-3">
    <path 
      d="M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5M7.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H7.5" 
      stroke="currentColor" 
      strokeWidth="1.67" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
)

export const Header: React.FC<HeaderProps> = ({ firstName, role, onLogout }) => {
  const [showLogout, setShowLogout] = useState(false)
  
  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  const handleLogoutClick = () => {
    setShowLogout(false)
    onLogout()
  }

  return (
    <header className={`bg-white h-[${sizes.header.height}] px-8 flex items-center justify-between border-b border-[${colors.border.default}]`}>
      <div className="flex items-center">
        <img src={LogoFull} alt="Sundaram Mutual" className="h-8" />
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <IconButton
            icon={<NotificationIcon />}
            className="hover:opacity-80 transition-opacity"
          />
          <Badge count={2} />
        </div>

        <div className="flex items-center gap-3">
          <Avatar initial={getInitial(firstName)} />
          
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[${colors.primary.text}]">{firstName}</span>
              <span className="text-sm text-[${colors.secondary.text}]">{role}</span>
            </div>
            
            <div className="relative">
              <IconButton 
                icon={<ChevronDownIcon />}
                onClick={() => setShowLogout(!showLogout)}
                className={`transition-transform ${showLogout ? 'rotate-180' : ''}`}
              />
              
              {showLogout && (
                <div className={`absolute right-0 mt-2 w-[240px] bg-white rounded-lg shadow-lg py-1 z-10 border border-[${colors.border.default}]`}>
                  <button
                    onClick={handleLogoutClick}
                    className={`flex w-full items-center px-4 py-2 text-sm text-[${colors.primary.text}] hover:bg-[${colors.background.hover}]`}
                  >
                    <LogoutIcon />
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
