import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { User } from '@/services/userApi';

interface DisableUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const DisableUserDialog: React.FC<DisableUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onCancel,
  onConfirm
}) => {
  if (!user) return null;

  const action = user.isDisabled ? 'Enable' : 'Disable';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white font-poppins">
        <DialogHeader>
          <DialogTitle>{action} User</DialogTitle>
          <DialogDescription>
            Are you sure you want to {action.toLowerCase()} {user.firstName} {user.lastName}? 
            {!user.isDisabled && " They will no longer be able to access the system."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            className="font-poppins"
            aria-label="Cancel user status change"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="font-poppins"
            aria-label={`Confirm ${action.toLowerCase()} user`}
          >
            {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisableUserDialog;
