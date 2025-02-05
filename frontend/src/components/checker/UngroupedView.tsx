import { ArrowRight, FileWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TableSummary {
  table_name: string;
  pending_count: number;
}

interface UngroupedViewProps {
  tables: TableSummary[];
}

export const UngroupedView = ({ tables }: UngroupedViewProps) => {
  const navigate = useNavigate();

  const handleTableClick = (tableName: string) => {
    navigate(`/checker/table/${tableName}`);
  };

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FileWarning className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No pending changes
        </h3>
        <p className="text-gray-500">
          There are no ungrouped changes to review
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tables.map((table) => (
        <div
          key={table.table_name}
          className="bg-white rounded-lg p-4 border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
          onClick={() => handleTableClick(table.table_name)}
        >
          <div>
            <h3 className="text-base font-medium text-gray-900 capitalize">
              {table.table_name.toLowerCase().replace(/_/g, " ")}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#FF5722] font-medium">
              {table.pending_count.toString().padStart(2, "0")}
            </span>
            <ArrowRight className="h-5 w-5 text-[#1A237E]" />
          </div>
        </div>
      ))}
    </div>
  );
};
