import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserRole } from '@/services/userApi';

interface UserFormProps {
  user: User;
  errors: Record<string, string>;
  showPassword: boolean;
  onUserChange: (updatedUser: User) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitButtonText: string;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  errors,
  showPassword,
  onUserChange,
  onTogglePassword,
  onSubmit,
  submitButtonText,
  isEdit = false
}) => {
  const handleInputChange = (field: keyof User, value: string) => {
    onUserChange({ ...user, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Input
            type="text"
            placeholder="First Name"
            value={user.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={errors.firstName ? 'border-red-500' : ''}
            aria-label="First Name"
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm" role="alert">{errors.firstName}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Input
            type="text"
            placeholder="Last Name"
            value={user.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={errors.lastName ? 'border-red-500' : ''}
            aria-label="Last Name"
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm" role="alert">{errors.lastName}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
            aria-label="Email"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-500 text-sm" role="alert">{errors.email}</p>
          )}
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={isEdit ? "Leave blank to keep unchanged" : "Password"}
            value={user.password || ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={errors.password ? 'border-red-500' : ''}
            aria-label="Password"
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1" role="alert">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Select
            value={user.role}
            onValueChange={(value: UserRole) => handleInputChange('role', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maker">Maker</SelectItem>
              <SelectItem value="checker">Checker</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full">
        {submitButtonText}
      </Button>
    </form>
  );
};

export default UserForm;
