import { useState, useCallback } from 'react';
import { User } from '../../../services/userApi';
import { DialogState } from '../../../types/user';
import { useToast } from '../../../hooks/use-toast';
import { createUser, getAllUsers, updateUser, toggleUserActive } from '../../../services/userApi';

const INITIAL_USER_STATE: User = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'maker'
};

const ITEMS_PER_PAGE = 10;

export const useUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>(INITIAL_USER_STATE);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogState, setDialogState] = useState<DialogState>({
    create: { open: false },
    edit: { open: false },
    disable: { open: false, user: null }
  });

  const loadUsers = useCallback(async () => {
    try {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
        setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users",
        variant: "destructive"
      });
    }
  }, [toast]);

  const validateForm = useCallback((data: User, isEditing: boolean = false): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.firstName.trim()) errors.firstName = "First name is required";
    if (!data.lastName.trim()) errors.lastName = "Last name is required";
    if (!data.email.trim()) errors.email = "Email is required";
    if (!isEditing && !data.password?.trim()) errors.password = "Password is required";
    if (!data.role) errors.role = "Role is required";

    return errors;
  }, []);

  const handleCreateUser = useCallback(async () => {
    const validationErrors = validateForm(newUser);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await createUser(newUser);
      if (response.success) {
        setNewUser(INITIAL_USER_STATE);
        setErrors({});
        setDialogState(prev => ({ ...prev, create: { open: false } }));
        loadUsers();
        toast({
          title: "Success",
          description: "User created successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive"
      });
    }
  }, [newUser, validateForm, toast, loadUsers]);

  const handleUpdateUser = useCallback(async () => {
    if (!editingUser?.id) return;

    const validationErrors = validateForm(editingUser, true);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await updateUser(String(editingUser.id), editingUser);
      if (response.success) {
        setEditingUser(null);
        setErrors({});
        setDialogState(prev => ({ ...prev, edit: { open: false } }));
        loadUsers();
        toast({
          title: "Success",
          description: "User updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive"
      });
    }
  }, [editingUser, validateForm, toast, loadUsers]);

  const handleToggleUserActive = useCallback(async () => {
    const user = dialogState.disable.user;
    if (!user?.email) return;

    try {
      const response = await toggleUserActive(user.email);
      if (response.success) {
        setDialogState(prev => ({ ...prev, disable: { open: false, user: null } }));
        loadUsers();
        toast({
          title: "Success",
          description: `User ${user.isDisabled ? 'enabled' : 'disabled'} successfully`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to toggle user status",
        variant: "destructive"
      });
    }
  }, [dialogState.disable.user, toast, loadUsers]);

  const handleCloseDisableDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, disable: { open: false, user: null } }));
  }, []);

  return {
    users,
    newUser,
    editingUser,
    showPassword,
    errors,
    currentPage,
    totalPages,
    dialogState,
    ITEMS_PER_PAGE,
    setNewUser,
    setEditingUser,
    setShowPassword,
    setCurrentPage,
    setDialogState,
    loadUsers,
    handleCreateUser,
    handleUpdateUser,
    handleToggleUserActive,
    handleCloseDisableDialog
  };
};
