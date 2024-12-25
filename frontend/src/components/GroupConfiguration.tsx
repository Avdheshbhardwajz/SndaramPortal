import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface TableGroup {
  id: string;
  name: string;
  tables: string[];
}

interface GroupConfigurationProps {
  availableTables: string[];
}

const GroupConfiguration: React.FC<GroupConfigurationProps> = ({ availableTables }) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<TableGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TableGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Placeholder for API calls - to be implemented later
  useEffect(() => {
    // Fetch groups from backend
    // For now using mock data
    setGroups([
      { id: '1', name: 'Default Group', tables: ['table1', 'table2'] }
    ]);
  }, []);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      tables: selectedTables
    };

    setGroups([...groups, newGroup]);
    handleCloseDialog();
    toast({
      title: "Success",
      description: "Group created successfully",
    });
  };

  const handleEditGroup = () => {
    if (!selectedGroup) return;

    const updatedGroups = groups.map(group =>
      group.id === selectedGroup.id
        ? { ...group, name: newGroupName, tables: selectedTables }
        : group
    );

    setGroups(updatedGroups);
    handleCloseDialog();
    toast({
      title: "Success",
      description: "Group updated successfully",
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    toast({
      title: "Success",
      description: "Group deleted successfully",
    });
  };

  const handleOpenDialog = (group?: TableGroup) => {
    if (group) {
      setIsEditing(true);
      setSelectedGroup(group);
      setNewGroupName(group.name);
      setSelectedTables(group.tables);
    } else {
      setIsEditing(false);
      setSelectedGroup(null);
      setNewGroupName('');
      setSelectedTables([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewGroupName('');
    setSelectedTables([]);
    setSelectedGroup(null);
    setIsEditing(false);
  };

  const handleTableSelection = (table: string) => {
    setSelectedTables(prev => 
      prev.includes(table)
        ? prev.filter(t => t !== table)
        : [...prev, table]
    );
  };

  return (
    <Card className="w-full font-['Poppins']">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-['Poppins']">Group Configuration</CardTitle>
        <Button onClick={() => handleOpenDialog()} variant="outline" className="font-['Poppins']">
          <Plus className="w-4 h-4 mr-2" />
          Create New Group
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.map(group => (
            <Card key={group.id} className="p-4 font-['Poppins']">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold font-['Poppins']">{group.name}</h3>
                  <p className="text-sm text-gray-500 font-['Poppins']">
                    {group.tables.length} tables assigned
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(group)}
                    className="font-['Poppins']"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="font-['Poppins']"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {group.tables.map(table => (
                    <span
                      key={table}
                      className="px-2 py-1 text-sm bg-gray-100 rounded-md font-['Poppins']"
                    >
                      {table}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white font-['Poppins']">
            <DialogHeader>
              <DialogTitle className="font-['Poppins']">
                {isEditing ? 'Edit Group' : 'Create New Group'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium font-['Poppins']">Group Name</label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="font-['Poppins']"
                />
              </div>
              <div>
                <label className="text-sm font-medium font-['Poppins']">Select Tables</label>
                <div className="mt-2 space-y-2">
                  {availableTables.map(table => (
                    <div key={table} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={table}
                        checked={selectedTables.includes(table)}
                        onChange={() => handleTableSelection(table)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={table} className="font-['Poppins']">{table}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} className="font-['Poppins']">
                Cancel
              </Button>
              <Button onClick={isEditing ? handleEditGroup : handleCreateGroup} className="font-['Poppins']">
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GroupConfiguration;
