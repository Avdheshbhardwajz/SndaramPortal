import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getGroupList, addGroup, addTable } from '@/services/groupApi';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GroupConfigurationProps {
  availableTables: string[];
}

interface TableGroup {
  group_id: string;
  group_name: string;
  tables: string[];
}

const GroupConfiguration: React.FC<GroupConfigurationProps> = ({ availableTables }) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<TableGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TableGroup | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddTablesDialogOpen, setIsAddTablesDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const groupList = await getGroupList();
      setGroups(groupList);
    } catch (error: unknown) {
      console.error('Failed to fetch groups:', error);
      setGroups([]);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addGroup(newGroupName.trim());
      await fetchGroups();
      setIsCreateDialogOpen(false);
      setNewGroupName('');
      toast({
        title: "Success",
        description: "Group created successfully",
      });
    } catch (error: unknown) {
      console.error('Failed to create group:', error);
      const message = error instanceof Error ? error.message : 'Failed to create group';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTablesToGroup = async () => {
    if (!selectedGroup || selectedTables.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one table",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add tables one by one
      for (const table of selectedTables) {
        await addTable(selectedGroup.group_name, table);
      }
      
      // Refresh the groups list
      await fetchGroups();
      
      setIsAddTablesDialogOpen(false);
      setSelectedTables([]);
      toast({
        title: "Success",
        description: "Tables added successfully",
      });
    } catch (error: unknown) {
      console.error('Failed to add tables:', error);
      const message = error instanceof Error ? error.message : 'Failed to add tables to group';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddTablesDialog = (group: TableGroup) => {
    setSelectedGroup(group);
    setSelectedTables([]);
    setIsAddTablesDialogOpen(true);
  };

  const handleDeleteGroup = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Info",
        description: "Delete functionality will be implemented soon",
      });
      await fetchGroups();
    } catch (error: unknown) {
      console.error('Failed to delete group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold font-['Poppins']">Group Configuration</CardTitle>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="outline"
            className="font-['Poppins']"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Group
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500 font-['Poppins']">
                Loading groups...
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-4 text-gray-500 font-['Poppins']">
                No groups available. Create a new group to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group, index) => (
                  <div key={group.group_id || `group-${group.group_name}-${index}`} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold font-['Poppins']">{group.group_name}</h3>
                        <p className="text-sm text-gray-500 font-['Poppins']">
                          {group.tables?.length || 0} tables assigned
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddTablesDialog(group)}
                          className="font-['Poppins']"
                          disabled={isLoading}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Tables
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteGroup()}
                          className="font-['Poppins']"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {group.tables && group.tables.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2 font-['Poppins']">Tables in this group:</h4>
                        <div className="flex flex-wrap gap-2">
                          {group.tables.map((table) => (
                            <span
                              key={`${group.group_id}-table-${table}`}
                              className="px-2 py-1 text-sm bg-gray-100 rounded-md font-['Poppins']"
                            >
                              {table}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Group Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="font-['Poppins']">Create New Group</DialogTitle>
                <DialogDescription className="font-['Poppins']">
                  Enter a name for the new group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-['Poppins']">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="font-['Poppins']"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewGroupName('');
                  }}
                  className="font-['Poppins']"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  className="font-['Poppins']"
                  disabled={isLoading}
                >
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Tables Dialog */}
          <Dialog open={isAddTablesDialogOpen} onOpenChange={setIsAddTablesDialogOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="font-['Poppins']">Add Tables to Group</DialogTitle>
                <DialogDescription className="font-['Poppins']">
                  Select tables to add to {selectedGroup?.group_name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  {availableTables.map((table) => (
                    <div key={`table-option-${table}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`checkbox-${table}`}
                        checked={selectedTables.includes(table)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedTables([...selectedTables, table]);
                          } else {
                            setSelectedTables(selectedTables.filter((t) => t !== table));
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`checkbox-${table}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-['Poppins']"
                      >
                        {table}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddTablesDialogOpen(false);
                    setSelectedTables([]);
                  }}
                  className="font-['Poppins']"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTablesToGroup}
                  className="font-['Poppins']"
                  disabled={isLoading}
                >
                  Add Tables
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupConfiguration;
