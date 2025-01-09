import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DataValue = string | number | boolean | null | undefined;

interface DataRecord {
  [key: string]: DataValue;
}

interface Notification {
  table_name: string;
  status: "approved" | "rejected";
  approver: string;
  updated_at: string;
  comments?: string;
  request_id: string;
  data: DataRecord;
  source: 'change_tracker' | 'add_row_table';
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationResponse {
  success: boolean;
  data: Notification[];
  message?: string;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (!userData.user_id) {
          setError("User ID not found");
          return;
        }

        const response = await fetch("http://localhost:8080/maker-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ maker_id: userData.user_id }),
        });

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
  }, [isOpen]);

  const renderChangeValue = (value: DataValue): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return String(value);
  };

  const renderNotificationContent = (notification: Notification) => {
    const formattedDate = format(new Date(notification.updated_at), "MMM d, yyyy h:mm a");
    const changes = notification.data
      ? Object.entries(notification.data).map(([key, value]) => {
          return `${key}: ${renderChangeValue(value)}`;
        })
      : [];

    return (
      <Card key={notification.request_id} className="mb-4 border-gray-200 font-poppins">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold capitalize">{notification.table_name.replace(/_/g, " ")}</h4>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
            <Badge 
              variant={notification.status === "approved" ? "default" : "destructive"}
              className={cn(
                "ml-2",
                notification.status === "approved" ? "bg-green-500 hover:bg-green-600" : undefined
              )}
            >
              {notification.status === "approved" ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )}
              {notification.status}
            </Badge>
          </div>
          
          <div className="text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Approver:</span> {notification.approver}
            </p>
            {notification.comments && (
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Comments:</span> {notification.comments}
              </p>
            )}
            {changes.length > 0 && (
              <div className="mt-2">
                <span className="font-medium">Changes:</span>
                <ul className="list-disc list-inside mt-1">
                  {changes.map((change, index) => (
                    <li key={index} className="text-gray-600">{change}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-gray-500">Loading notifications...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }

    if (!notifications.length) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-gray-500">No notifications found</div>
        </div>
      );
    }

    return notifications.map(renderNotificationContent);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white" side="right">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-2">
              <ScrollArea className="h-[calc(100vh-180px)]">
                {renderContent()}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="approved" className="mt-2">
              <ScrollArea className="h-[calc(100vh-180px)]">
                {!loading && !error && notifications
                  .filter(n => n.status === "approved")
                  .map(renderNotificationContent)}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="rejected" className="mt-2">
              <ScrollArea className="h-[calc(100vh-180px)]">
                {!loading && !error && notifications
                  .filter(n => n.status === "rejected")
                  .map(renderNotificationContent)}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
