import { User, UserRole } from '@/services/userApi';

export interface UserApiResponse {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DialogState {
  disable: {
    open: boolean;
    user: User | null;
  };
  edit: {
    open: boolean;
  };
}