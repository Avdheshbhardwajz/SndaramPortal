export type ColumnValue = string | number | boolean | null | undefined;

export interface RequestDataPayload {
  table_name: string;
  old_values: Record<string, ColumnValue>;
  new_values: Record<string, ColumnValue>;
  row_id?: string;
  table_id?: string;
}

export interface RequestDataResponse {
  success: boolean;
  message?: string;
  error?: string;
}
