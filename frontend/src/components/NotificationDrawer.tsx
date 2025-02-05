import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  notificationService,
  type Notification,
} from "@/services/notificationService";
import { ChangesDialog } from "./ChangesDialog";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: "maker" | "checker" | "admin";
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const userRole = role;

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.fetchNotifications(userRole);
      setNotifications(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (userRole === "checker") {
      navigate(`/checker/table/${notification.table_name}`);
    } else if (userRole === "maker") {
      if (notification.old_data && notification.new_data) {
        setSelectedNotification(notification);
        setShowChangesDialog(true);
      }
    } else if (userRole === "admin") {
      navigate(`/admin/tables/${notification.table_name}`);
    }
    onClose();
  };

  const renderNotificationContent = (notification: Notification) => {
    return (
      <div
        className="bg-white rounded-lg p-4 border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                {notification.pending_count} Pending
              </span>
              <span className="text-xs text-gray-500">
                {new Date(notification.updated_at)
                  .toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .replace(",", " |")}
              </span>
            </div>

            <h3 className="text-sm font-medium text-gray-900 capitalize">
              {notification.table_name.toLowerCase().replace(/_/g, " ")}
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Maker: {notification.maker}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md bg-white">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>

          <div className="mt-4">
            <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-[#1A237E]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No notifications available
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div key={notification.request_id || index}>
                      {renderNotificationContent(notification)}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {selectedNotification && (
        <ChangesDialog
          isOpen={showChangesDialog}
          onClose={() => {
            setShowChangesDialog(false);
            setSelectedNotification(null);
          }}
          changes={{
            old_data: selectedNotification.old_data || {},
            new_data: selectedNotification.new_data || {},
          }}
          tableName={selectedNotification.table_name}
        />
      )}
    </>
  );
};
