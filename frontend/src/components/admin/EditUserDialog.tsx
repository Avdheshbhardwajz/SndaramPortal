import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import UserForm from './UserForm';
import { User } from '@/services/userApi';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  errors: Record<string, string>;
  showPassword: boolean;
  onUserChange: (updatedUser: User) => void;
  onTogglePassword: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onOpenChange,
  editingUser,
  errors,
  showPassword,
  onUserChange,
  onTogglePassword,
  onCancel,
  onSave
}) => {
  if (!editingUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white font-poppins">
        <DialogHeader>
          <DialogTitle className="font-poppins">Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <UserForm
            user={editingUser}
            errors={errors}
            showPassword={showPassword}
            onUserChange={onUserChange}
            onTogglePassword={onTogglePassword}
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
            submitButtonText="Save Changes"
            isEdit={true}
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="font-poppins"
            aria-label="Cancel editing user"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            className="font-poppins"
            aria-label="Save user changes"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
