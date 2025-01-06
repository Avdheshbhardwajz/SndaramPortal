import React, { useState, useCallback, useEffect } from 'react';
import { Edit2, Eye, EyeOff, LogOut, Ban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RowRequestManager } from '@/components/RowRequestManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import ColumnConfigurator from '@/components/ColumnConfigurator';
import DropdownManager from '@/components/DropdownManager';
import GroupConfiguration from '@/components/GroupConfiguration';
import { createUser, getAllUsers, updateUser, disableUser, User } from '@/services/userApi';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { UserApiResponse, DialogState } from '@/types/user';

const INITIAL_USER_STATE: User = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'maker'
};

const Admin = () => {
  const navigate = useNavigate();
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
  const [tables, setTables] = useState<string[]>([]);

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

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    }
    loadUsers();
  }, [navigate, loadUsers]);

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userData');
    navigate('/login');
  }, [navigate]);

  // Load tables from backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get(`/api/table`);
        if (response.data && response.data.success && response.data.tables) {
          // Extract table names from the response
          const tableNames = response.data.tables.map((table: { table_name: string }) => table.table_name);
          setTables(tableNames);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tables",
          variant: "destructive",
        });
      }
    };

    fetchTables();
  }, [toast]);

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

  // Handle disable user
  const handleDisableClick = useCallback((user: User) => {
    setDialogState(prev => ({
      ...prev,
      disable: { open: true, user }
    }));
  }, []);

  const handleDisableConfirm = useCallback(async () => {
    const user = dialogState.disable.user;
    if (!user?.id) return;

    try {
      await disableUser(user.id.toString());
      setDialogState(prev => ({
        ...prev,
        disable: { open: false, user: null }
      }));
      loadUsers();
      toast({
        title: "Success",
        description: "User disabled successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to disable user";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    }
  }, [dialogState.disable.user, loadUsers, toast]);

  // Dialog handlers
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* User Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className='font-poppins'>
              Create New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* User Management Table */}
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
                      <td className="px-6 py-4 whitespace-nowrap">{user.isDisabled ? 'Disabled' : 'Active'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                          className="inline-flex items-center gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDisableClick(user)}
                          disabled={user.isDisabled}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Row Requests Section */}
        <RowRequestManager />

        {/* Configuration Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ColumnConfigurator tables={tables} />
          <DropdownManager tables={tables} />
          <GroupConfiguration availableTables={tables} />
        </div>
      </div>

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

      {/* Disable Confirmation Dialog */}
      <Dialog 
        open={dialogState.disable.open}
        onOpenChange={(open) => 
          setDialogState(prev => ({ ...prev, disable: { ...prev.disable, open } }))
        }
      >
        <DialogContent className="bg-white font-poppins">
          <DialogHeader>
            <DialogTitle>Disable User</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable this user? They will no longer be able to access the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => 
                setDialogState(prev => ({ ...prev, disable: { open: false, user: null } }))
              }
              className="font-poppins"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDisableConfirm}
              className="font-poppins"
            >
              Disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;