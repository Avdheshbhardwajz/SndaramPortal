import React, { useState } from "react";
import { fetchCheckerNotifications } from "@/services/api";
import { Bell, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  type: "change" | "add_row";
  table_name: string;
  status: string;
  approver: string;
  updated_at: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
  comments: string | null;
  request_id: string;
}

interface NotificationDrawerProps {
  role: "checker" | "maker";
}

interface Change {
  field: string;
  oldValue: string;
  newValue: string;
}

export function NotificationDrawer({ role }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [expandedNotification, setExpandedNotification] = useState<
    string | null
  >(null);
  const { toast } = useToast();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetchCheckerNotifications(role);
      if (response.success && Array.isArray(response.notifications)) {
        setNotifications(response.notifications);
      } else {
        setNotifications([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notifications data",
        });
      }
    } catch (error: unknown) {
      setNotifications([]);
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

  const getChanges = (notification: Notification): Change[] => {
    if (!notification.old_data || !notification.new_data) return [];

    const changes: Change[] = [];
    Object.keys(notification.new_data).forEach((key) => {
      const oldValue = String(notification.old_data?.[key] ?? "");
      const newValue = String(notification.new_data?.[key] ?? "");
      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue,
          newValue,
        });
      }
    });
    return changes;
  };

  const toggleChanges = (notificationId: string) => {
    setExpandedNotification(
      expandedNotification === notificationId ? null : notificationId
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "approved") return notification.status === "approved";
    if (selectedTab === "rejected") return notification.status === "rejected";
    return true;
  });

  const approvedCount = notifications.filter(
    (n) => n.status === "approved"
  ).length;
  const rejectedCount = notifications.filter(
    (n) => n.status === "rejected"
  ).length;

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy, hh:mm a");
    } catch (error) {
      return dateString;
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
          {Array.isArray(notifications) && notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white">
        <SheetHeader className="border-b pb-4 flex justify-between items-center">
          <SheetTitle>Notifications</SheetTitle>
          <SheetTrigger asChild>
            <button className="rounded-sm opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </SheetTrigger>
        </SheetHeader>

        <Tabs defaultValue="all" className="w-full mt-4">
          <TabsList className="w-full border-b mb-4">
            <TabsTrigger
              value="all"
              onClick={() => setSelectedTab("all")}
              className={`flex-1 ${
                selectedTab === "all" ? "border-b-2 border-orange-500" : ""
              }`}
            >
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              onClick={() => setSelectedTab("approved")}
              className={`flex-1 ${
                selectedTab === "approved" ? "border-b-2 border-orange-500" : ""
              }`}
            >
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              onClick={() => setSelectedTab("rejected")}
              className={`flex-1 ${
                selectedTab === "rejected" ? "border-b-2 border-orange-500" : ""
              }`}
            >
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No notifications found
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.request_id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        notification.status === "approved"
                          ? "bg-green-500 text-white"
                          : notification.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {notification.status.charAt(0).toUpperCase() +
                        notification.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(notification.updated_at)}
                    </span>
                  </div>
                  <h3 className="text-base font-medium">
                    {notification.type === "change"
                      ? "Update in"
                      : "New entry in"}{" "}
                    {notification.table_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.status === "rejected"
                      ? "Rejector"
                      : "Approver"}
                    : {notification.approver}
                  </p>

                  {notification.status === "rejected" &&
                  notification.comments ? (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm text-gray-700 font-medium">
                        Rejection Comment:
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.comments}
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleChanges(notification.request_id)}
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center gap-1"
                      >
                        Changes
                        {expandedNotification === notification.request_id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {expandedNotification === notification.request_id && (
                        <div className="mt-3 border-t pt-3">
                          {notification.type === "change" ? (
                            getChanges(notification).length === 0 ? (
                              <p className="text-gray-500 text-sm">
                                No changes found
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {getChanges(notification).map(
                                  (change, index) => (
                                    <div
                                      key={index}
                                      className="border-b pb-2 last:border-b-0"
                                    >
                                      <p className="font-medium text-sm text-gray-700">
                                        {change.field}
                                      </p>
                                      <div className="mt-1 grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-xs text-gray-500">
                                            Old Value:
                                          </p>
                                          <p className="text-sm">
                                            {change.oldValue || "N/A"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">
                                            New Value:
                                          </p>
                                          <p className="text-sm">
                                            {change.newValue || "N/A"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          ) : (
                            <div className="space-y-2">
                              {Object.entries(notification.data || {}).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="border-b pb-2 last:border-b-0"
                                  >
                                    <p className="font-medium text-sm text-gray-700">
                                      {key}
                                    </p>
                                    <p className="text-sm mt-1">
                                      {String(value) || "N/A"}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
