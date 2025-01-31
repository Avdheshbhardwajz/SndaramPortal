export interface ChangeTrackerData {
  request_id: string;
  id?: string;
  maker?: string;
  created_at: string;
  comments?: string;
  table_name: string;
  status: "pending" | "approved" | "rejected";
  new_data?: Record<string, unknown>;
  old_data?: Record<string, unknown>;
  row_id?: string;
}

export interface Change {
  id: string;
  row_id: string;
  request_id: string;
  user: string;
  dateTime: string;
  tableName: string;
  rowData: Record<string, unknown>;
  changedColumns?: string[];
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
}

export interface GroupData {
  group_name: string;
  table_list: string[];
}

export interface TableContentProps {
  tableName: string;
  tableChanges: Change[];
  selectedChanges: Record<string, boolean>;
  setSelectedChanges: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  handleApproveAll: () => void;
  handleRejectAll: () => void;
  handleApprove: (rowId: string, requestId: string) => void;
  handleReject: (changeId: string) => void;
  toggleChangeSelection: (changeId: string) => void;
}

export interface Group {
  id: string;
  name: string;
  changes: Change[];
}

export interface CheckerState {
  pendingChanges: Change[];
  groups: Group[];
  loading: boolean;
  selectedChanges: Record<string, boolean>;
  activeTab: string;
  groupView: boolean;
  isRejectModalOpen: boolean;
  rejectChangeId: string | null;
}
