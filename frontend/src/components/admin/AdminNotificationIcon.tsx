import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminNotificationDrawer } from "./AdminNotificationDrawer";

interface AdminNotification {
  table_name: string;
  maker: string;
  created_at: string;
  pending_count: number;
}

interface NotificationResponse {
  success: boolean;
  data: AdminNotification[];
  message?: string;
}

export function AdminNotificationIcon() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch("http://localhost:8080/admin-notification", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const result = await response.json() as NotificationResponse;
        if (result.success) {
          const total = result.data.reduce((sum, notification) => sum + notification.pending_count, 0);
          setTotalPending(total);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsDrawerOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {totalPending > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {totalPending}
          </Badge>
        )}
      </Button>
      <AdminNotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
