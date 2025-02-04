import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import type { Notification } from "@/services/notificationService";

interface AdminNotificationsProps {
  notifications: Notification[];
  onRefresh: () => Promise<void>;
}

const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  notifications,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Notifications</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No notifications available
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <div
              key={notification.request_id}
              className="bg-white rounded-lg border p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    Changes in {notification.table_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    By {notification.maker}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                  {notification.pending_count} pending changes
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Last updated: {formatDate(notification.updated_at)}
              </div>
              {notification.comments && (
                <p className="text-sm text-gray-600">{notification.comments}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
