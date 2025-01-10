export interface GridTableProps {
  tableName: string;
}

export enum EditType {
  TEXT = "text",
  SELECT = "select",
  DATE = "date",
  NUMBER = "number",
}

export interface ColumnConfig {
  field: string;
  headerName?: string;
  displayName?: string;
  isEditable?: boolean;
  editType?: EditType;
  width?: number;
  dropdownOptions?: string[];
  valueFormatter?: (value: string | number | boolean | null) => string;
  valueGetter?: (params: {
    data: Record<string, string | number | boolean | null>;
  }) => string | number | boolean | null;
  hide?: boolean;
  readOnly?: boolean;
}

export interface ValidationError {
  hasError: boolean;
  message?: string;
}

export interface ValidationErrors {
  [key: string]: ValidationError;
}

export interface RowData {
  id?: string | number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface PendingChanges {
  [rowId: string]: string[];
}

export interface ChangeRecord {
  rowId: string;
  originalData: RowData;
  changes: Record<string, string | number | boolean | null>;
  originalValues: Record<string, string | number | boolean | null>;
  timestamp: number;
}

export interface GridResponse {
  data: RowData[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  success: boolean;
  message?: string;
}

export interface GridState {
  loading: boolean;
  error: string | null;
  data: RowData[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface GridActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setData: (data: RowData[]) => void;
  setPagination: (pagination: GridState["pagination"]) => void;
  reset: () => void;
}

export interface CellRendererProps {
  value: string | number | boolean | null;
  data: RowData;
  field: string;
  isPending?: boolean;
  isDateField?: boolean;
  editType?: string;
}

export interface PendingChange {
  oldValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
  timestamp: number;
}

export interface EditFieldProps {
  field: string;
  value: string | number | boolean | null;
  validation?: ValidationError;
  config: ColumnConfig;
  onChange: (field: string, value: string | number | boolean | null) => void;
}
