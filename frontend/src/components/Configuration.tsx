import React, { useState, useEffect } from 'react';
import { useConfiguration } from './configuration/hooks/useConfiguration';
import { ConfigurationTabs } from './configuration/ConfigurationTabs';
import  ColumnConfiguration  from './configuration/ColumnConfiguration';
import DropdownManagement from './configuration/DropdownManagement';
import GroupConfiguration from './configuration/GroupConfiguration';
import { dropdownConfigService } from '../services/dropdownConfigService';

const Configuration: React.FC = () => {
  const { activeTab, handleTabChange } = useConfiguration();
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tablesList = await dropdownConfigService.getTables();
        setTables(tablesList);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };
    fetchTables();
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'column':
        return <ColumnConfiguration />;
      case 'dropdown':
        return <DropdownManagement tables={tables} />;
      case 'group':
        return <GroupConfiguration />;
      default:
        return <ColumnConfiguration />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <ConfigurationTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default Configuration;
