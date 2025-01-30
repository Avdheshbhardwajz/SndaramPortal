import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Button } from '../ui/button';
import { User } from '../../services/userApi';
import { UserForm } from './UserForm';

interface UserDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  user: User;
  errors: Record<string, string>;
  showPassword: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onTogglePassword: () => void;
  onUserChange: (user: User) => void;
}

export const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  title,
  description,
  user,
  errors,
  showPassword,
  isEditing = false,
  onClose,
  onSubmit,
  onTogglePassword,
  onUserChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[650px] p-4 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <UserForm
          user={user}
          errors={errors}
          showPassword={showPassword}
          isEditing={isEditing}
          onTogglePassword={onTogglePassword}
          onUserChange={onUserChange}
        />

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="bg-orange-600 hover:bg-orange-700">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
