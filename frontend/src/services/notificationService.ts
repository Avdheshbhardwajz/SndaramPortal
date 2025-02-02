import { API_URL, ENDPOINTS } from "../config/constants";

export interface Notification {
  id?: string;
  request_id: string;
  type: "change" | "add_row";
  table_name: string;
  status: string;
  approver: string;
  updated_at: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  data?: Record<string, any>;
  comments?: string;
  isAdminNotification?: boolean;
}

interface AdminNotification {
  table_name: string;
  maker: string;
  created_at: string;
  pending_count: number;
}

interface NotificationResponse {
  success: boolean;
  notifications?: Notification[];
  data?: AdminNotification[];
  message?: string;
}

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
        ENDPOINTS.NOTIFICATIONS[
          role.toUpperCase() as keyof typeof ENDPOINTS.NOTIFICATIONS
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

      if (role === "admin" && responseData.data) {
        // Transform admin notifications to match the expected format
        return responseData.data.map((adminNotif) => ({
          id: `${adminNotif.table_name}-${adminNotif.maker}`,
          request_id: adminNotif.maker,
          type: "change",
          table_name: adminNotif.table_name,
          status: "pending",
          approver: "",
          updated_at: adminNotif.created_at,
          comments: `${adminNotif.pending_count} pending changes`,
          isAdminNotification: true,
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
