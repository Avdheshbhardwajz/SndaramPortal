import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface AdminNotification {
  table_name: string;
  maker: string;
  created_at: string;
  pending_count: number;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationResponse {
  success: boolean;
  data: AdminNotification[];
  message?: string;
}

export function AdminNotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("http://localhost:8080/admin-notification");
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const result = await response.json() as NotificationResponse;
        if (result.success) {
          setNotifications(result.data || []);
        } else {
          setError(result.message || "Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const renderNotificationContent = (notification: AdminNotification) => {
    const formattedDate = format(new Date(notification.created_at), "MMM d, yyyy h:mm a");

    return (
      <Card key={`${notification.table_name}-${notification.maker}`} className="mb-4 font-poppins border-gray-200">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold capitalize">{notification.table_name.replace(/_/g, " ")}</h4>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {notification.pending_count} pending
            </Badge>
          </div>
          
          <div className="text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Maker:</span> {notification.maker}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40 font-poppins">
          <div className="text-gray-500">Loading notifications...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-40 font-poppins">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }

    if (!notifications.length) {
      return (
        <div className="flex items-center justify-center h-40 font-poppins">
          <div className="text-gray-500">No pending row additions found</div>
        </div>
      );
    }

    return notifications.map(renderNotificationContent);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] font-poppins bg-white" side="right">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Pending Row Additions</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {renderContent()}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
