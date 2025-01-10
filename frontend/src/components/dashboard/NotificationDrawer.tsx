import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the structure for employee data
interface EmployeeData {
  dim_employee_sk: number | string;
  name: string;
  code: string;
  department: string;
  location: string;
  state: string | null;
  channel: string | null;
  sub_channel: string | null;
  institutional_tag: string | null;
  branch: string;
  rm_type: string;
  location_type: string;
  created_by: string;
  modified_by: string;
  created_on: string;
  modified_on: string;
  dim_manager_sk: number | null;
  period_from: string | null;
  period_to: string | null;
  role: string | null;
  row_id?: string;
}

// Union type for different data record types
type DataRecord = EmployeeData;

interface Notification {
  type: 'change' | 'add_row';
  table_name: string;
  status: "approved" | "rejected";
  approver: string;
  updated_at: string;
  old_data?: DataRecord;
  new_data?: DataRecord;
  data?: DataRecord;
  comments?: string;
  request_id: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
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
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        const response = await fetch("http://localhost:8080/maker-notification", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const result = await response.json() as NotificationResponse;
        if (result.success) {
          setNotifications(result.notifications || []);
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

  const findChanges = (oldData?: DataRecord, newData?: DataRecord): string[] => {
    if (!oldData || !newData) return [];
    
    const changes: string[] = [];
    (Object.keys(newData) as Array<keyof DataRecord>).forEach(key => {
      if (oldData[key] !== newData[key]) {
        const oldValue = oldData[key] === null ? 'null' : String(oldData[key]);
        const newValue = newData[key] === null ? 'null' : String(newData[key]);
        changes.push(`${key}: ${oldValue} → ${newValue}`);
      }
    });
    return changes;
  };

  const renderNotificationContent = (notification: Notification) => {
    const formattedDate = format(new Date(notification.updated_at), "MMM d, yyyy h:mm a");
    const changes = notification.type === 'change' 
      ? findChanges(notification.old_data, notification.new_data)
      : notification.data 
        ? Object.entries(notification.data).map(([key, value]) => `${key}: ${String(value)}`)
        : [];

    return (
      <Card key={notification.request_id} className="mb-4 border-gray-200 font-poppins">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold capitalize">
                {notification.type === 'change' ? 'Update in' : 'New entry in'} {notification.table_name.replace(/_/g, " ")}
              </h4>
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
              <div className="mt-2 bg-gray-50 p-2 rounded">
                <span className="font-medium">Changes:</span>
                <ul className="list-disc list-inside mt-1">
                  {changes.map((change, index) => (
                    <li key={index} className="text-gray-600 break-all">{change}</li>
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
        <div className="flex items-center justify-center h-40 text-center">
          <div>
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      );
    }

    if (!notifications.length) {
      return (
        <div className="flex items-center justify-center h-40 text-center">
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
