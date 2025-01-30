import React from 'react';
import { Button } from '../ui/button';
import { Edit2, Ban } from 'lucide-react';
import { User } from '../../services/userApi';

interface UserTableProps {
  users: User[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (user: User) => void;
  onToggleDisable: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentPage,
  itemsPerPage,
  onEdit,
  onToggleDisable,
}) => {
  return (
    <table className="min-w-full">
      <thead>
        <tr key="header" className="border-b">
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Edit</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Action</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">No</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((user, index) => (
            <tr key={user.email} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </td>
              <td className="px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleDisable(user)}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {`${user.firstName} ${user.lastName}`}
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">{user.email}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{user.role}</td>
              <td className="px-4 py-2 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    user.isDisabled
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {user.isDisabled ? 'Disabled' : 'Active'}
                </span>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
