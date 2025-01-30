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

interface DisableUserDialogProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DisableUserDialog: React.FC<DisableUserDialogProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[450px] p-4">
        <DialogHeader>
          <DialogTitle>
            {user.isDisabled ? 'Enable User' : 'Disable User'}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {user.isDisabled ? 'enable' : 'disable'} this user?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {user.isDisabled ? 'Enable' : 'Disable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
