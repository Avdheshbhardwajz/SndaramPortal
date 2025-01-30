import React, { useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { useUserManagement } from './user-management/hooks/useUserManagement';
import { Pagination } from './Pagination';
import { UserTable } from './user-management/UserTable';
import { UserDialog } from './user-management/UserDialog';
import { DisableUserDialog } from './user-management/DisableUserDialog';
import { UserManagementHeader } from './user-management/UserManagementHeader';

const UserManagement: React.FC = () => {
  const {
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
  } = useUserManagement();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <>
      <div className="space-y-6">
        <UserManagementHeader setDialogState={setDialogState} />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto font-poppins">
              <UserTable
                users={users}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onEdit={(user) => {
                  setEditingUser(user);
                  setDialogState(prev => ({ ...prev, edit: { open: true } }));
                }}
                onToggleDisable={(user) => {
                  setDialogState(prev => ({
                    ...prev,
                    disable: { open: true, user }
                  }));
                }}
              />
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UserDialog
        isOpen={dialogState.create.open}
        title="Create User"
        user={newUser}
        errors={errors}
        showPassword={showPassword}
        onUserChange={setNewUser}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onClose={() => {
          setDialogState(prev => ({ ...prev, create: { open: false } }));
          setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'maker' });
          setShowPassword(false);
        }}
        onSubmit={handleCreateUser}
      />

      <UserDialog
        isOpen={dialogState.edit.open}
        title="Edit User"
        user={editingUser || { firstName: '', lastName: '', email: '', role: 'maker' }}
        errors={errors}
        showPassword={showPassword}
        isEditing={true}
        onUserChange={setEditingUser}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onClose={() => {
          setDialogState(prev => ({ ...prev, edit: { open: false } }));
          setEditingUser(null);
          setShowPassword(false);
        }}
        onSubmit={handleUpdateUser}
      />

      <DisableUserDialog
        isOpen={dialogState.disable.open}
        user={dialogState.disable.user}
        onClose={handleCloseDisableDialog}
        onConfirm={handleToggleUserActive}
      />
    </>
  );
};

export default UserManagement;
