import React, { useState, useCallback, useEffect } from 'react';
import { Edit2, Eye, EyeOff, Ban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createUser, getAllUsers, updateUser, toggleUserActive, User } from '@/services/userApi';
import { useToast } from '@/hooks/use-toast';
import { UserApiResponse, DialogState } from '@/types/user';

const INITIAL_USER_STATE: User = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'maker'
};

const UserManagement: React.FC = () => {
  const { toast } = useToast();

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>(INITIAL_USER_STATE);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogState, setDialogState] = useState<DialogState>({
    disable: { open: false, user: null },
    edit: { open: false }
  });

  // Load users from backend
  const loadUsers = useCallback(async () => {
    try {
      const response = await getAllUsers();
      if (response.success) {
        const transformedUsers = response.data.map((user: UserApiResponse) => ({
          id: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          isDisabled: user.is_disabled
        }));
        setUsers(transformedUsers);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load users";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Form validation
  const validateForm = useCallback((user: User, isEdit = false): Record<string, string> => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.firstName?.trim()) errors.firstName = 'First name is required';
    if (!user.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!user.email?.trim()) errors.email = 'Email is required';
    if (!emailRegex.test(user.email)) errors.email = 'Invalid email format';
    
    // Password validation for new users
    if (!isEdit) {
      if (!user.password) {
        errors.password = 'Password is required';
      } else if (user.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
    }
    return errors;
  }, []);

  // Render helpers
  const renderFormInput = useCallback((field: keyof User, label: string, type: string = 'text', value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
    <div className="grid gap-2">
      <Input
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
        className={errors[field] ? 'border-red-500' : ''}
        aria-label={label}
        aria-invalid={!!errors[field]}
      />
      {errors[field] && (
        <p className="text-red-500 text-sm" role="alert">{errors[field]}</p>
      )}
    </div>
  ), [errors]);

  // Create user handler
  const handleCreateUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(newUser);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form"
      });
      return;
    }
    
    try {
      const response = await createUser(newUser);
      if (response.success) {
        setNewUser(INITIAL_USER_STATE);
        setErrors({});
        loadUsers();
        toast({
          title: "Success",
          description: "User created successfully"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to perform operation";
      toast({
        variant: "destructive",
        title: "Error",
        description:  errorMessage
      });
    }
  }, [newUser, validateForm, toast, loadUsers]);

  // Handle user disable/enable
  const handleToggleUserActive = async (user: User) => {
    setDialogState(prev => ({
      ...prev,
      disable: { open: true, user }
    }));
  };

  const confirmToggleUserActive = async () => {
    const user = dialogState.disable.user;
    if (!user?.id) return;

    try {
      const response = await toggleUserActive(user.id.toString());
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        // Update the user's status in the local state immediately
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id 
              ? { ...u, isDisabled: !u.isDisabled }
              : u
          )
        );
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setDialogState(prev => ({
        ...prev,
        disable: { open: false, user: null }
      }));
    }
  };

  // Handle edit click
  const handleEditClick = useCallback((user: User) => {
    setEditingUser({ ...user });
    setDialogState(prev => ({
      ...prev,
      edit: { open: true }
    }));
    setErrors({});
  }, []);

  // Update user handler
  const handleUpdateUser = useCallback(async () => {
    if (!editingUser?.id) return;

    const validationErrors = validateForm(editingUser, true);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form"
      });
      return;
    }

    try {
      const response = await updateUser(editingUser.id.toString(), {
        email: editingUser.email,
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        role: editingUser.role,
        password: editingUser.password // Only included if changed
      });

      if (response.success) {
        setDialogState(prev => ({ ...prev, edit: { open: false } }));
        setEditingUser(null);
        setErrors({});
        loadUsers();
        toast({
          title: "Success",
          description: "User updated successfully"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    }
  }, [editingUser, validateForm, toast, loadUsers]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className='font-poppins'>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-poppins">
              {renderFormInput(
                'firstName',
                'First Name',
                'text',
                newUser.firstName,
                (e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))
              )}
              {renderFormInput(
                'lastName',
                'Last Name',
                'text',
                newUser.lastName,
                (e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))
              )}
              {renderFormInput(
                'email',
                'Email',
                'email',
                newUser.email,
                (e) => setNewUser(prev => ({ ...prev, email: e.target.value }))
              )}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} 
                  className={errors.password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Select
                  value={newUser.role}
                  onValueChange={(value: 'maker' | 'checker') => setNewUser(prev => ({ ...prev, role: value }))} 
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
            <Button
              type="submit"
              className="w-full"
            >
              Create User
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='font-poppins'>User Management</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        user.isDisabled 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isDisabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleUserActive(user)}
                        title={user.isDisabled ? "Enable User" : "Disable User"}
                      >
                        {user.isDisabled ? <Eye className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                        className="inline-flex items-center gap-1"
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
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog 
        open={dialogState.edit.open} 
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, edit: { open } }))} 
      >
        <DialogContent className="bg-white font-poppins">
          <DialogHeader>
            <DialogTitle className="font-poppins">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-firstName" className="font-poppins">First Name</label>
                <Input
                  id="edit-firstName"
                  value={editingUser?.firstName || ''}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, firstName: e.target.value }) : null)}
                  className={`${errors.firstName ? 'border-red-500' : ''} font-poppins`}
                />
                {errors.firstName && <p className="text-red-500 text-sm font-poppins">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-lastName" className="font-poppins">Last Name</label>
                <Input
                  id="edit-lastName"
                  value={editingUser?.lastName || ''}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, lastName: e.target.value }) : null)}
                  className={`${errors.lastName ? 'border-red-500' : ''} font-poppins`}
                />
                {errors.lastName && <p className="text-red-500 text-sm font-poppins">{errors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-email" className="font-poppins">Email</label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  className={`${errors.email ? 'border-red-500' : ''} font-poppins`}
                />
                {errors.email && <p className="text-red-500 text-sm font-poppins">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-role" className="font-poppins">Role</label>
                <Select
                  value={editingUser?.role || ''}
                  onValueChange={(value: 'maker' | 'checker') => setEditingUser(prev => prev ? ({ ...prev, role: value }) : null)}
                >
                  <SelectTrigger className="font-poppins">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white font-poppins">
                    <SelectItem value="maker">Maker</SelectItem>
                    <SelectItem value="checker">Checker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <label htmlFor="edit-password" className="font-poppins">Password (leave blank to keep unchanged)</label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={editingUser?.password || ''}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, password: e.target.value }) : null)}
                    placeholder="Leave blank to keep unchanged"
                    className="font-poppins"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogState(prev => ({ ...prev, edit: { open: false } }));
                setEditingUser(null);
                setErrors({});
              }}
              className="font-poppins"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="font-poppins">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable/Enable User Confirmation Dialog */}
      <Dialog 
        open={dialogState.disable.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, disable: { ...prev.disable, open } }))}
      >
        <DialogContent className="bg-white font-poppins">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              {dialogState.disable.user?.isDisabled ? 'Enable User' : 'Disable User'}
            </DialogTitle>
            <DialogDescription className="font-poppins">
              Are you sure you want to {dialogState.disable.user?.isDisabled ? 'enable' : 'disable'} {dialogState.disable.user?.firstName} {dialogState.disable.user?.lastName}?
              {!dialogState.disable.user?.isDisabled && (
                <p className="mt-2 text-sm text-gray-500">
                  This user will no longer be able to access the system until re-enabled.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogState(prev => ({ ...prev, disable: { open: false, user: null } }))}
              className="font-poppins"
            >
              Cancel
            </Button>
            <Button
              variant={dialogState.disable.user?.isDisabled ? "default" : "destructive"}
              onClick={confirmToggleUserActive}
              className="font-poppins"
            >
              {dialogState.disable.user?.isDisabled ? 'Enable User' : 'Disable User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;