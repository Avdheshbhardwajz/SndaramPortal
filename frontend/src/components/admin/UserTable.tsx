import React from 'react';
import { Ban, Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/services/userApi';

interface UserTableProps {
  users: User[];
  onEditClick: (user: User) => void;
  onToggleActive: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEditClick, onToggleActive }) => {
  return (
    <div className="overflow-x-auto font-poppins">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.isDisabled ? 'Disabled' : 'Active'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleActive(user)}
                  title={user.isDisabled ? "Enable User" : "Disable User"}
                  aria-label={user.isDisabled ? "Enable User" : "Disable User"}
                >
                  {user.isDisabled ? <Eye className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEditClick(user)}
                  className="inline-flex items-center gap-1"
                  aria-label="Edit User"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
