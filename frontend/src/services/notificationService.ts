import { API_URL, ENDPOINTS } from '../config/constants'

interface Notification {
  id: string
  message: string
  status: 'approved' | 'rejected' | 'pending'
  timestamp: string
  table: string
}

interface NotificationResponse {
  success: boolean
  notifications: Notification[]
  message?: string
}

export const notificationService = {
  async fetchNotifications(role: 'maker' | 'checker' | 'admin'): Promise<Notification[]> {
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.error('No authentication token found')
      return []
    }

    try {
      const endpoint = ENDPOINTS.NOTIFICATIONS[role.toUpperCase() as keyof typeof ENDPOINTS.NOTIFICATIONS]
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data: NotificationResponse = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch notifications')
      }

      return data.notifications
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.error('No authentication token found')
      return false
    }

    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }
}
