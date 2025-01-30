export interface RowRequest {
    id: number
    userId: string
    date: string
    time: string
    employeeId: string
    oldName: string
    newName: string
  }
  
  export interface TabItem {
    id: string
    label: string
    isActive?: boolean
  }
  
  export interface FilterButton {
    id: string
    label: string
  }
  
  