import { ArrowRight, ChevronRight, FileWarning } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface TableSummary {
  table_name: string;
  pending_count: number;
}

interface GroupedViewProps {
  groups: {
    [groupName: string]: TableSummary[];
  };
}

export const GroupedView = ({ groups }: GroupedViewProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const groupNames = Object.keys(groups);
    if (groupNames.length > 0 && !selectedGroup) {
      setSelectedGroup(groupNames[0]);
    }
  }, [groups]);

  const handleTableClick = (tableName: string) => {
    navigate(`/checker/table/${tableName}`);
  };

  if (Object.keys(groups).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FileWarning className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No pending changes
        </h3>
        <p className="text-gray-500">
          There are no changes to review in any groups
        </p>
      </div>
    );
  }

  if (selectedGroup === null) {
    return (
      <div className="flex gap-4">
        <div className="w-64 bg-gray-100 rounded-lg animate-pulse h-[400px]" />
        <div className="flex-1 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left sidebar with groups */}
      <div className="w-64 bg-gray-50 rounded-lg overflow-hidden">
        {Object.keys(groups).map((groupName) => (
          <button
            key={groupName}
            className={`w-full text-left px-6 py-4 border-b border-gray-100 flex items-center justify-between transition-colors ${
              selectedGroup === groupName
                ? "bg-[#1A237E] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedGroup(groupName)}
          >
            <span className="font-medium capitalize">
              {groupName.toLowerCase()}
            </span>
            <ChevronRight
              className={`h-5 w-5 transition-transform ${
                selectedGroup === groupName
                  ? "rotate-90 text-white"
                  : "text-gray-400"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Right side with tables */}
      <div className="flex-1">
        {selectedGroup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups[selectedGroup]?.map((table) => (
              <div
                key={table.table_name}
                onClick={() => handleTableClick(table.table_name)}
                className="bg-white rounded-lg px-6 py-4 border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
              >
                <h3 className="text-base font-medium text-gray-900 capitalize">
                  {table.table_name.toLowerCase().replace(/_/g, " ")}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-[#FF5722] font-medium text-lg">
                    {table.pending_count.toString().padStart(2, "0")}
                  </span>
                  <ArrowRight className="h-5 w-5 text-[#1A237E]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
