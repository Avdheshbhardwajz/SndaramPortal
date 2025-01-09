import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ColumnConfigurator from '@/components/ColumnConfigurator';
import DropdownManager from '@/components/DropdownManager';
import GroupConfiguration from '@/components/GroupConfiguration';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const Configuration: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/table`);
        if (response.data && response.data.success && response.data.tables) {
          const tableNames = response.data.tables.map((table: { table_name: string }) => table.table_name);
          setTables(tableNames);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tables",
          variant: "destructive",
        });
      }
    };

    fetchTables();
  }, [toast]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className='font-poppins'>Column Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <ColumnConfigurator tables={tables} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className='font-poppins'>Dropdown Management</CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownManager tables={tables} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className='font-poppins'>Group Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupConfiguration availableTables={tables} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuration;

