import React from 'react';
import { Button } from "@/components/ui/button";
import { TableInfo, SelectedTableState } from "@/types/tables";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from 'lucide-react';
import { cn } from "@/lib/utils";

const HIDDEN_TABLES = [
  'OTP_tracker',
  'add_row_table',
  'checker_table',
  'maker_table',
  'notification_table',
  'user_table'
];

interface SidebarProps {
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  tables: TableInfo[];
  setSelectedTable: (table: SelectedTableState) => void;
  selectedTable: SelectedTableState;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sidebarOpen, 
  isLoading, 
  error, 
  tables, 
  setSelectedTable,
  selectedTable
}) => (
  <aside 
    className={`fixed md:static inset-y-0 left-0 z-20 bg-[#f8fafc] border-r transform transition-transform duration-300 ease-in-out w-64
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0'}`}
  >
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 px-3 font-poppins">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003087]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 mt-4 bg-red-50 rounded-md text-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-1 py-4">
            {tables
              .filter(table => !HIDDEN_TABLES.includes(table.name))
              .map((table) => {
                const isSelected = selectedTable.name === table.name;
                return (
                  <Button
                    key={table.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal group",
                      isSelected 
                        ? "bg-[#003087] text-white hover:bg-[#003087] hover:text-white"
                        : "hover:bg-[#003087]/5 hover:text-[#003087]"
                    )}
                    onClick={() => setSelectedTable({
                      name: table.name,
                      filename: table.filename
                    })}
                  >
                    <Database className={cn(
                      "mr-2 h-4 w-4",
                      isSelected 
                        ? "text-white" 
                        : "text-muted-foreground group-hover:text-[#003087]"
                    )} />
                    <span className="truncate">{table.name}</span>
                  </Button>
                );
              })}
          </div>
        )}
      </ScrollArea>
    </div>
  </aside>
);
