import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectedTableState } from '@/types/tables';
import { useTables } from '@/hooks/useTables';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { GridTable } from '@/components/grid/GridTable';
import MainContent from '@/components/MainContent';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tables, isLoading: isTablesLoading, error: tablesError } = useTables();
  
  const [selectedTable, setSelectedTable] = useState<SelectedTableState>({
    name: null,
    filename: null
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (tablesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: tablesError
      });
    }
  }, [tablesError, toast]);

  useEffect(() => {
    if (isTablesLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
    setProgress(0);
  }, [isTablesLoading]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  if (isTablesLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 font-poppins">
        <div className="w-full max-w-xs space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
          <Progress value={progress} className="h-1 w-full" />
          <div className="text-sm font-medium text-gray-600">Loading tables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          isLoading={isTablesLoading}
          error={tablesError}
          tables={tables}
          setSelectedTable={setSelectedTable}
          selectedTable={selectedTable}
        />
        <main 
          className={`flex-1 p-4 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'md:ml-0' : 'ml-0'}`}
        >
          <div className="container mx-auto h-full">
            <div className="rounded-lg border bg-white shadow-sm p-4 h-full">
              {selectedTable.name && selectedTable.filename ? (
                <GridTable tableName={selectedTable.filename} />
              ) : (
                <MainContent />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
