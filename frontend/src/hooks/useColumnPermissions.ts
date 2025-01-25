import { useState, useEffect } from 'react';
import { config } from '../config/env';

interface ColumnStatus {
  column_name: string;
  column_status: 'editable' | 'non-editable';
}

interface ColumnPermissions {
  [key: string]: boolean;
}

export const useColumnPermissions = (tableName: string) => {
  const [columnPermissions, setColumnPermissions] = useState<ColumnPermissions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumnPermissions = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/fetchColumnStatus`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ table_name: tableName }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch column permissions');
        }

        const data = await response.json();
        
        if (data.success) {
          // Convert array of column statuses to permissions object
          const permissions: ColumnPermissions = {};
          data.data.forEach((column: ColumnStatus) => {
            permissions[column.column_name] = column.column_status === 'editable';
          });
          setColumnPermissions(permissions);
        } else {
          setError(data.message || 'Failed to fetch column permissions');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (tableName) {
      fetchColumnPermissions();
    }
  }, [tableName]);

  const isColumnEditable = (columnName: string): boolean => {
    // If the column is not in permissions, treat it as non-editable
    return columnPermissions[columnName] ?? false;
  };

  const getEditableColumns = (allColumns: string[]): string[] => {
    return allColumns.filter(column => isColumnEditable(column));
  };

  return {
    columnPermissions,
    isLoading,
    error,
    isColumnEditable,
    getEditableColumns,
  };
};
