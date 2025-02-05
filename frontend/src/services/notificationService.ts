import { API_URL, ENDPOINTS } from "../config/constants";

export interface Notification {
  id?: string;
  request_id: string;
  type: "change" | "add_row";
  table_name: string;
  status: string;
  approver: string;
  updated_at: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
  comments?: string;
  isAdminNotification?: boolean;
  maker?: string;
  pending_count?: number;
}

interface AdminNotification {
  table_name: string;
  maker: string;
  created_at: string;
  pending_count: number;
}

interface CheckerNotification {
  table_name: string;
  maker: string;
  created_at: string;
  pending_count: number;
}

interface NotificationResponse {
  success: boolean;
  notifications?: Notification[];
  data?: CheckerNotification[] | AdminNotification[];
  message?: string;
}

const NOTIFICATION_ENDPOINTS = {
  ADMIN: "/admin-notification",
  MAKER: "/maker-notification",
  CHECKER: "/checker-notification",
} as const;

export const notificationService = {
  async fetchNotifications(
    role: "maker" | "checker" | "admin"
  ): Promise<Notification[]> {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      return [];
    }

    try {
      const endpoint =
        NOTIFICATION_ENDPOINTS[
          role.toUpperCase() as keyof typeof NOTIFICATION_ENDPOINTS
        ];
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const responseData: NotificationResponse = await response.json();

      if (!responseData.success) {
        throw new Error(
          responseData.message || "Failed to fetch notifications"
        );
      }

      // Transform checker notifications
      if (role === "checker" && responseData.data) {
        const checkerData = responseData.data as CheckerNotification[];
        return checkerData.map((checkerNotif) => ({
          request_id: `${checkerNotif.table_name}-${checkerNotif.maker}`,
          type: "change",
          table_name: checkerNotif.table_name,
          status: "pending",
          maker: checkerNotif.maker,
          updated_at: checkerNotif.created_at,
          pending_count: checkerNotif.pending_count,
          approver: "",
        }));
      }

      // Handle admin notifications
      if (role === "admin" && responseData.data) {
        // Transform admin notifications to match the expected format
        return responseData.data.map((adminNotif) => ({
          id: `${adminNotif.table_name}-${adminNotif.maker}`,
          request_id: `${adminNotif.table_name}-${adminNotif.maker}`,
          type: "change",
          table_name: adminNotif.table_name,
          status: "pending",
          approver: "",
          updated_at: adminNotif.created_at,
          comments: `${adminNotif.pending_count} pending changes`,
          isAdminNotification: true,
          maker: adminNotif.maker,
          pending_count: adminNotif.pending_count,
        }));
      }

      return responseData.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      return false;
    }

    try {
      // Skip if it's an admin notification (these don't need to be marked as read)
      if (notificationId.includes("-")) {
        return true;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },
};

export const fetchCheckerNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(ENDPOINTS.NOTIFICATIONS.CHECKER, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch notifications");
  }

  return data.data;
};
