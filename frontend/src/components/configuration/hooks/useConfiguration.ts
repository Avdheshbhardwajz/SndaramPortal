import { useState } from 'react';

export type ConfigurationType = 'column' | 'dropdown' | 'group';

export const useConfiguration = () => {
  const [activeTab, setActiveTab] = useState<ConfigurationType>('column');

  const handleTabChange = (tab: ConfigurationType) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    handleTabChange,
  };
};
