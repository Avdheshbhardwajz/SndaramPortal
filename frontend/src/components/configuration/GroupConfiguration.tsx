import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, FolderOpen, Loader2 } from "lucide-react";
//import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/Dialog";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../../hooks/use-toast";
import {
  getGroupList,
  addGroup,
  addTable,
  deleteGroup,
  deleteTable,
  getAllTables,
} from "../../services/groupApi";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
//import { dropdownConfigService } from '../../services/dropdownConfigService';

// Types
// interface GroupConfigurationProps {
// }

interface TableGroup {
  group_id: string;
  group_name: string;
  tables: string[];
}

// Components

const AddTablesDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  selectedGroup: TableGroup | null;
  availableTables: string[];
  selectedTables: string[];
  onTableSelectionChange: (table: string, checked: boolean) => void;
  isLoading: boolean;
  isLoadingTables: boolean;
}> = ({
  isOpen,
  onClose,
  onAdd,
  selectedGroup,
  availableTables,
  selectedTables,
  onTableSelectionChange,
  isLoading,
  isLoadingTables,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter tables based on search query and exclude tables already in the group
  const filteredTables = availableTables
    .filter(table => !selectedGroup?.tables?.includes(table))
    .filter(table => table.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          selectedTables.forEach(table => onTableSelectionChange(table, false));
        }
      }}
    >
      <DialogContent className="bg-white sm:max-w-[525px] max-h-[85vh] flex flex-col p-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold font-['Poppins']">
            Add Tables to Group
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-['Poppins']">
            Select tables to add to <span className="font-medium text-gray-700">{selectedGroup?.group_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-['Poppins']"
              disabled={isLoadingTables}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[40vh] pr-4 rounded-md border">
            {isLoadingTables ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500 font-['Poppins']">Loading tables...</span>
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FolderOpen className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 font-['Poppins']">
                  {searchQuery 
                    ? 'No tables match your search' 
                    : availableTables.length === 0
                      ? 'No tables available'
                      : 'All available tables are already in this group'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredTables.map((table) => (
                  <div
                    key={`table-option-${table}`}
                    className="flex items-center space-x-3 py-2 px-2 rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`checkbox-${table}`}
                      checked={selectedTables.includes(table)}
                      onCheckedChange={(checked) =>
                        onTableSelectionChange(table, checked as boolean)
                      }
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor={`checkbox-${table}`}
                      className="text-sm font-medium leading-none cursor-pointer select-none font-['Poppins']"
                    >
                      {table}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="pt-6">
          <div className="flex justify-between items-center text-sm text-gray-500 font-['Poppins'] mb-4">
            <span>{selectedTables.length} tables selected</span>
            {selectedTables.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedTables.forEach(table => onTableSelectionChange(table, false))}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </Button>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                selectedTables.forEach(table => onTableSelectionChange(table, false));
              }}
              className="font-['Poppins'] px-4"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onAdd}
              className="font-['Poppins'] px-4"
              disabled={isLoading || selectedTables.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Selected Tables'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const GroupConfiguration: React.FC = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<TableGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TableGroup | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddTablesDialogOpen, setIsAddTablesDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // Select first group by default if none selected
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const groupList = await getGroupList();
      setGroups(groupList);
      // Update selectedGroup with the latest data if it exists
      if (selectedGroup) {
        const updatedSelectedGroup = groupList.find(g => g.group_id === selectedGroup.group_id);
        if (updatedSelectedGroup) {
          setSelectedGroup(updatedSelectedGroup);
        }
      }
    } catch (error: unknown) {
      console.error("Failed to fetch groups:", error);
      setGroups([]);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        className: "bg-[#003087] text-white border-none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    setIsLoadingTables(true);
    try {
      const tables = await getAllTables();
      setAvailableTables(tables);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available tables",
        className: "bg-[#003087] text-white border-none",
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleOpenAddTablesDialog = async (group: TableGroup) => {
    setSelectedGroup(group);
    setSelectedTables([]);
    setIsAddTablesDialogOpen(true);
    await fetchAvailableTables();
  };

  const handleTableSelectionChange = (table: string, checked: boolean) => {
    if (checked) {
      setSelectedTables(prev => [...prev, table]);
    } else {
      setSelectedTables(prev => prev.filter(t => t !== table));
    }
  };

  const handleAddTablesToGroup = async () => {
    if (!selectedGroup || selectedTables.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one table",
        className: "bg-[#003087] text-white border-none",
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
        className: "bg-[#003087] text-white border-none",
      });
    } catch (error: unknown) {
      console.error("Failed to add tables:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to add tables to group";
      toast({
        title: "Error",
        description: message,
        className: "bg-[#003087] text-white border-none",
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
        className: "bg-[#003087] text-white border-none",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addGroup(newGroupName.trim());
      await fetchGroups();
      setIsCreateDialogOpen(false);
      setNewGroupName("");
      toast({
        title: "Success",
        description: "Group created successfully",
        className: "bg-[#003087] text-white border-none",
      });
    } catch (error: unknown) {
      console.error("Failed to create group:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create group";
      toast({
        title: "Error",
        description: message,
        className: "bg-[#003087] text-white border-none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (group: TableGroup) => {
    setIsLoading(true);
    try {
      await deleteGroup(group.group_name);
      await fetchGroups();
      toast({
        title: "Success",
        description: "Group deleted successfully",
        className: "bg-[#003087] text-white border-none",
      });
    } catch (error: unknown) {
      console.error("Failed to delete group:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete group";
      toast({
        title: "Error",
        description: message,
        className: "bg-[#003087] text-white border-none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (groupName: string, tableName: string) => {
    setIsLoading(true);
    try {
      await deleteTable(groupName, tableName);
      await fetchGroups();
      toast({
        title: "Success",
        description: "Table removed from group successfully",
        className: "bg-[#003087] text-white border-none",
      });
    } catch (error: unknown) {
      console.error("Failed to remove table from group:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove table from group";
      toast({
        title: "Error",
        description: message,
        className: "bg-[#003087] text-white border-none",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar - Groups List */}
      <div className="w-72 bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.group_id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedGroup?.group_id === group.group_id
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm font-['Poppins']">{group.group_name}</div>
              <div className="text-xs text-gray-500 mt-1 font-['Poppins']">
                {group.tables?.length || 0} tables assigned
              </div>
            </button>
          ))}
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full flex items-center gap-2 text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium font-['Poppins']">Create New Group</span>
          </button>
        </div>
      </div>

      {/* Right Content - Selected Group Tables */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
        {selectedGroup ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-['Poppins']">{selectedGroup.group_name}</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteGroup(selectedGroup)}
                  className="text-gray-600 hover:text-red-600 font-['Poppins']"
                >
                  Delete Group
                </Button>
                <Button
                  onClick={() => handleOpenAddTablesDialog(selectedGroup)}
                  className="bg-blue-700 text-white hover:bg-blue-800 font-['Poppins']"
                >
                  Add Tables
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedGroup.tables?.map((table) => (
                <div
                  key={table}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <span className="text-sm font-medium font-['Poppins']">{table}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTable(selectedGroup.group_name, table)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-500 mb-2">
              <FolderOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 font-['Poppins']">No Group Selected</h3>
            <p className="text-sm text-gray-500 mt-1 font-['Poppins']">
              Select a group from the sidebar or create a new one
            </p>
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold font-['Poppins']">Create New Group</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 font-['Poppins']">
              Enter a name for your new group
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="font-['Poppins']"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewGroupName("");
              }}
              className="font-['Poppins']"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || isLoading}
              className="font-['Poppins']"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tables Dialog */}
      <AddTablesDialog
        isOpen={isAddTablesDialogOpen}
        onClose={() => setIsAddTablesDialogOpen(false)}
        onAdd={handleAddTablesToGroup}
        selectedGroup={selectedGroup}
        availableTables={availableTables}
        selectedTables={selectedTables}
        onTableSelectionChange={handleTableSelectionChange}
        isLoading={isLoading}
        isLoadingTables={isLoadingTables}
      />
    </div>
  );
};

export default GroupConfiguration;
