import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Drawer } from './ui/Drawer'
import { ChangesDialog } from './ChangesDialog'

interface Notification {
  id?: string
  request_id: string
  type: 'change' | 'add_row'
  table_name: string
  status: string
  approver: string
  updated_at: string
  old_data?: Record<string, any>
  new_data?: Record<string, any>
  data?: Record<string, any>
  comments?: string
}

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
}

const NotificationCard = ({ notification }: { notification: Notification }) => {
  const [showChanges, setShowChanges] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-[#DCFCE7] text-[#166534]'
      case 'rejected':
        return 'bg-[#FEE2E2] text-[#991B1B]'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Unknown date'
    }
  }

  const getChangesData = () => {
    if (notification.type === 'change') {
      return {
        old_data: notification.old_data || {},
        new_data: notification.new_data || {},
      }
    }
    return {
      old_data: {},
      new_data: notification.data || {},
    }
  }

  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
            {notification.status}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {formatDate(notification.updated_at)}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        Update in {notification.table_name}
      </h3>
      <p className="text-sm text-gray-500 mb-2">
        {notification.type === 'change' ? 'Record modified' : 'New record added'}
      </p>
      <button 
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        onClick={() => setShowChanges(true)}
      >
        View Changes
      </button>

      <ChangesDialog
        isOpen={showChanges}
        onClose={() => setShowChanges(false)}
        changes={getChangesData()}
        tableName={notification.table_name}
      />
    </div>
  )
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
}) => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'approved' | 'rejected'>('all')

  const groupedNotifications = React.useMemo(() => ({
    all: notifications,
    approved: notifications.filter(n => n?.status?.toLowerCase() === 'approved'),
    rejected: notifications.filter(n => n?.status?.toLowerCase() === 'rejected'),
  }), [notifications])

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({groupedNotifications.all.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'approved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved ({groupedNotifications.approved.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'rejected'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Rejected ({groupedNotifications.rejected.length})
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {(groupedNotifications[activeTab] || []).map((notification) => (
          <NotificationCard
            key={notification.request_id}
            notification={notification}
          />
        ))}
      </div>
    </Drawer>
  )
}
