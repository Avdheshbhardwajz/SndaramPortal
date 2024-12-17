export interface RequestDataPayload {
  table_name: string;
  old_values: Record<string, string | number | boolean | null>;
  new_values: Record<string, string | number | boolean | null>;
  maker_id: number;
  comments?: string;
}
