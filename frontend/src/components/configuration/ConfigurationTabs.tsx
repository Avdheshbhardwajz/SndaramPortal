import React from 'react';
import { ConfigurationType } from './hooks/useConfiguration';

interface ConfigurationTabsProps {
  activeTab: ConfigurationType;
  onTabChange: (tab: ConfigurationType) => void;
}

export const ConfigurationTabs: React.FC<ConfigurationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: ConfigurationType; label: string }[] = [
    { id: 'column', label: 'Column Configuration' },
    { id: 'dropdown', label: 'Dropdown Management' },
    { id: 'group', label: 'Group Configuration' },
  ];

  return (
    <div className="flex gap-4 mb-2 p-2 ">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : ' bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
