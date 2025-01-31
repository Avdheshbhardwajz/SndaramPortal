import type React from "react"
import { useState, useEffect } from "react"
import { IconButton } from "./ui/IconButton"
import { Avatar } from "./ui/Avatar"
import { Bell, ChevronDown } from "lucide-react"
import { NotificationDrawer } from "./NotificationDrawer"
import { notificationService } from "../services/notificationService"
import logo from "../assets/images/Logo-Full.svg"
import type { Notification } from "../services/notificationService"

interface HeaderProps {
  firstName: string
  role: string
  onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ firstName, role, onLogout }) => {
  const [showLogout, setShowLogout] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const isAdmin = role.toLowerCase() === 'admin'

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userRole = role.toLowerCase() as "maker" | "checker" | "admin"
        const data = await notificationService.fetchNotifications(userRole)
        setNotifications(data || [])
        setUnreadCount((data || []).length)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setNotifications([])
        setUnreadCount(0)
      }
    }

    fetchNotifications()
    
    // Set up polling for notifications if admin
    let pollingInterval: NodeJS.Timeout | null = null
    if (isAdmin) {
      pollingInterval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds for admin
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [role, isAdmin])

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications && notifications.length > 0 && !isAdmin) {
      // Skip marking as read for admin notifications since they represent ongoing pending changes
      try {
        await Promise.all(
          notifications.map(notification => 
            notificationService.markAsRead(notification.id || '')
          )
        )
        setUnreadCount(0)
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    }
  }

  return (
    <header className=" sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Sundaram Mutual"
            className="h-8"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <IconButton
              icon={<Bell className="w-5 h-5 text-gray-700" />}
              className="hover:opacity-80 transition-opacity"
              onClick={handleNotificationClick}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-medium text-white">{unreadCount}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Avatar initial={firstName[0]} size="small" />

            <div className="flex items-center gap-2">
              <div>
                <span className="text-[#6C5DD3] font-medium">{role}</span>
                <span className="mx-1 text-gray-500">|</span>
                <span className="text-gray-900">{firstName}</span>
              </div>

              <IconButton
                icon={<ChevronDown className="w-5 h-5 text-gray-700" />}
                onClick={() => setShowLogout(!showLogout)}
                className={`transition-transform ${showLogout ? "rotate-180" : ""}`}
              />

              {showLogout && (
                <div className="absolute right-6 top-14 w-48 bg-white rounded-lg shadow-lg border border-gray-100">
                  <button
                    onClick={() => {
                      onLogout()
                      setShowLogout(false)
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-3">
                      <path
                        d="M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5M7.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H7.5"
                        stroke="currentColor"
                        strokeWidth="1.67"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />
    </header>
  )
}
