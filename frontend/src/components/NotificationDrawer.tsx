import React, { useState } from "react";
import { fetchCheckerNotifications } from "@/services/api";
import { Bell, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface CheckerNotification {
  table_name: string;
  maker: string;
  created_at: string;
  pending_count: number;
}

interface NotificationDrawerProps {
  role: "checker" | "maker";
}

export function NotificationDrawer({ role }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<CheckerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetchCheckerNotifications(role);
      setNotifications(response.data);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications",
      });
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          onClick={loadNotifications}
          className="relative p-2 rounded-full hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="bg-white">
        <SheetHeader className="flex items-center justify-between border-b pb-4">
          <SheetTitle>Notifications</SheetTitle>
          <SheetTrigger asChild>
            <button className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </SheetTrigger>
        </SheetHeader>
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No new notifications
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.table_name}
                  className="bg-white rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 rounded-full">
                        {notification.pending_count} Pending
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(notification.created_at),
                        "dd MMM 'yy | h:mm a"
                      )}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">
                    {notification.table_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Maker : {notification.maker}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
