import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { DialogState } from '../../types/user';

interface UserManagementHeaderProps {
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  setDialogState
}) => {
  return (
    <div className="flex justify-end">
      <Button
        onClick={() => setDialogState(prev => ({ ...prev, create: { open: true } }))}
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add user
      </Button>
    </div>
  );
};
