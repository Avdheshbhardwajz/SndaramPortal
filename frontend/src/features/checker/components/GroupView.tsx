import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchGroupList } from "@/services/api";
import { useChecker } from "../hooks/useChecker";
import { TableContent } from "./TableContent";

interface TableSummary {
  name: string;
  count: number;
  changes: Array<{
    request_id: string;
    old_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
  }>;
}

interface GroupData {
  group_name: string;
  table_list: string[];
  row_id: string | null;
}

interface GroupViewProps {
  tableSummaries: Record<string, TableSummary>;
}

export function GroupView({ tableSummaries }: GroupViewProps) {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedChanges, setSelectedChanges] = useState<
    Record<string, boolean>
  >({});
  const { toast } = useToast();
  const {
    pendingChanges,
    handleApprove,
    handleReject,
    handleApproveAll,
    handleRejectAll,
  } = useChecker();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetchGroupList();
        if (response.success && response.data.length > 0) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load groups",
        });
      }
    };

    loadGroups();
  }, [toast]);

  // Filter groups that have changes
  const groupsWithChanges = groups.filter((group) => {
    const totalChanges = group.table_list.reduce((total, tableName) => {
      return total + (tableSummaries[tableName]?.count || 0);
    }, 0);
    return totalChanges > 0;
  });

  // Get the selected group's tables
  const selectedGroupData = groups.find((g) => g.group_name === selectedGroup);
  const groupTables = selectedGroupData?.table_list || [];

  // Get only tables that have changes
  const tablesWithChanges = groupTables.filter(
    (tableName) => (tableSummaries[tableName]?.count || 0) > 0
  );

  // Calculate total changes for the group
  const groupTotalChanges = tablesWithChanges.reduce((total, tableName) => {
    return total + (tableSummaries[tableName]?.count || 0);
  }, 0);

  return (
    <div className="flex gap-6">
      {/* Left sidebar with groups */}
      <div className="w-64 bg-gray-50 rounded-lg p-4">
        {groupsWithChanges.map((group) => {
          const totalChanges = group.table_list.reduce((total, tableName) => {
            return total + (tableSummaries[tableName]?.count || 0);
          }, 0);

          return (
            <button
              key={group.group_name}
              onClick={() => {
                setSelectedGroup(group.group_name);
                setSelectedTable(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-md mb-2 transition-colors ${
                selectedGroup === group.group_name
                  ? "bg-white shadow-sm"
                  : "hover:bg-white/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">
                    {group.group_name}
                  </span>
                  <div className="text-[#FF6B00] text-sm mt-1">
                    {String(totalChanges).padStart(2, "0")} changes
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedGroup === group.group_name ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Right side content */}
      <div className="flex-1">
        {!selectedGroup ? (
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">No group selected</p>
              <p className="text-gray-500 text-sm">
                Please select a group from the left sidebar to view tables
              </p>
            </div>
          </div>
        ) : selectedTable ? (
          <TableContent
            tableName={selectedTable}
            pendingChanges={pendingChanges}
            selectedChanges={selectedChanges}
            setSelectedChanges={setSelectedChanges}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleApproveAll={handleApproveAll}
            handleRejectAll={handleRejectAll}
            onBack={() => setSelectedTable(null)}
          />
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {selectedGroup}
              </h2>
              <p className="text-sm text-gray-600">
                {String(groupTotalChanges).padStart(2, "0")} total changes in
                this group
              </p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {tablesWithChanges.length === 0 ? (
                <div className="col-span-2 h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg mb-2">
                      No tables found
                    </p>
                    <p className="text-gray-500 text-sm">
                      No tables with changes available in this group
                    </p>
                  </div>
                </div>
              ) : (
                tablesWithChanges
                  .filter((tableName) => tableSummaries[tableName]?.count)
                  .map((tableName) => {
                    const tableData = tableSummaries[tableName];
                    return (
                      <Card
                        key={tableName}
                        onClick={() => setSelectedTable(tableName)}
                        className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {tableName}
                            </h3>
                            <div className="text-[#FF6B00] font-medium mt-1">
                              {String(tableData.count).padStart(2, "0")}
                            </div>
                          </div>
                          <ArrowRight className="text-gray-400 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </Card>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
