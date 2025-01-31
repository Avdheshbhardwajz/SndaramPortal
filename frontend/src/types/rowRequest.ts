export interface RowRequest {
  request_id: string
  table_name: string
  row_data: string | Record<string, unknown>
  status: string
  maker: string
  created_at: string
  updated_at: string
  admin?: string
  comments?: string
  dim_employee_sk?: number
  name?: string
}

export interface DataDialogProps {
  isOpen: boolean
  onClose: () => void
  data: Record<string, unknown>
}

export interface RejectDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comments: string) => void
  title: string
}
