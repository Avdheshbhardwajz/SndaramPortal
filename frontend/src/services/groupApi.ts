import axios from "axios";

const API_BASE_URL = "/api";

export interface TableGroup {
  group_id: string;
  group_name: string;
  tables: string[];
  table_list?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const getGroupList = async (): Promise<TableGroup[]> => {
  try {
    const response = await axios.get<ApiResponse<TableGroup[]>>(
      `${API_BASE_URL}/getgrouplist`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch groups");
    }

    return (response.data.data || []).map((group) => {
      const tables = group.table_list || group.tables || [];
      return {
        ...group,
        tables,
        group_id: group.group_id || group.group_name, // Fallback to group_name if id is not present
      };
    });
  } catch (error) {
    console.error("Error fetching group list:", error);
    throw error;
  }
};

export const addGroup = async (name: string): Promise<void> => {
  try {
    const response = await axios.post<ApiResponse<void>>(
      `${API_BASE_URL}/addgroup`,
      {
        group_name: name,
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add group");
    }
  } catch (error) {
    console.error("Error adding group:", error);
    throw error;
  }
};

export const addTable = async (
  groupName: string,
  tableName: string
): Promise<void> => {
  try {
    const response = await axios.post<ApiResponse<void>>(
      `${API_BASE_URL}/addtable`,
      {
        group_name: groupName,
        table_list: [tableName],
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add table");
    }
  } catch (error) {
    console.error("Error adding table:", error);
    throw error;
  }
};

export const deleteGroup = async (groupName: string): Promise<void> => {
  try {
    const response = await axios.post<ApiResponse<void>>(
      `${API_BASE_URL}/removegroup`,
      {
        group_name: groupName,
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete group");
    }
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

export const deleteTable = async (
  groupName: string,
  tableName: string
): Promise<void> => {
  try {
    const response = await axios.post<ApiResponse<void>>(
      `${API_BASE_URL}/removetable`,
      {
        group_name: groupName,
        table_name: tableName,
      }
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to delete table from group"
      );
    }
  } catch (error) {
    console.error("Error deleting table:", error);
    throw error;
  }
};
