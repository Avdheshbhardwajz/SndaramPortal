export interface LoginResponse {
    success: boolean
    message: string
    token?: string
    data?: {
      email: string
      role: string
      first_name: string
      last_name: string
    }
    redirectPath?: string
  }
  
  export interface OTPResponse {
    success: boolean
    message: string
  }
  
  