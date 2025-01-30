import React from 'react';
import { Input } from '../ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User, UserRole } from '../../services/userApi';

interface UserFormProps {
  user: User;
  errors: Record<string, string>;
  showPassword: boolean;
  isEditing?: boolean;
  onTogglePassword: () => void;
  onUserChange: (updatedUser: User) => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  errors,
  showPassword,
  isEditing = false,
  onTogglePassword,
  onUserChange,
}) => {
  const handleChange = (field: keyof User, value: string) => {
    onUserChange({ ...user, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${isEditing ? 'edit' : 'create'}-firstName`} className="text-sm font-medium text-gray-700 block mb-1">
          First Name
        </label>
        <Input
          id={`${isEditing ? 'edit' : 'create'}-firstName`}
          value={user.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label htmlFor={`${isEditing ? 'edit' : 'create'}-lastName`} className="text-sm font-medium text-gray-700 block mb-1">
          Last Name
        </label>
        <Input
          id={`${isEditing ? 'edit' : 'create'}-lastName`}
          value={user.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
        )}
      </div>

      <div>
        <label htmlFor={`${isEditing ? 'edit' : 'create'}-email`} className="text-sm font-medium text-gray-700 block mb-1">
          Email
        </label>
        <Input
          id={`${isEditing ? 'edit' : 'create'}-email`}
          type="email"
          value={user.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {!isEditing && (
        <div>
          <label htmlFor={`${isEditing ? 'edit' : 'create'}-password`} className="text-sm font-medium text-gray-700 block mb-1">
            Password
          </label>
          <div className="relative">
            <Input
              id={`${isEditing ? 'edit' : 'create'}-password`}
              type={showPassword ? 'text' : 'password'}
              value={user.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor={`${isEditing ? 'edit' : 'create'}-role`} className="text-sm font-medium text-gray-700 block mb-1">
          Role
        </label>
        <Select
          value={user.role}
          onValueChange={(value: UserRole) => handleChange('role', value)}
        >
          <SelectTrigger className={`w-full ${errors.role ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="maker">Maker</SelectItem>
            <SelectItem value="checker">Checker</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-red-500 text-sm mt-1">{errors.role}</p>
        )}
      </div>
    </div>
  );
};
