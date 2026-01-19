/**
 * DEMO MANAGER ENTERPRISE - FULL LAYOUT
 * Main container combining sidebar + content
 * Enterprise-grade demo management
 */

import React, { useState } from 'react';
import { DMESidebar, DMESection } from './DMESidebar';
import { DMEOverviewScreen } from './screens/DMEOverviewScreen';
import { DMELibraryScreen } from './screens/DMELibraryScreen';
import { DMECategoryScreen } from './screens/DMECategoryScreen';
import { DMEHealthScreen } from './screens/DMEHealthScreen';
import { DMECompletionScreen } from './screens/DMECompletionScreen';
import { DMEValaAIScreen } from './screens/DMEValaAIScreen';
import { DMEUrlsScreen } from './screens/DMEUrlsScreen';
import { DMESecurityScreen } from './screens/DMESecurityScreen';
import { DMELogsScreen } from './screens/DMELogsScreen';
import { DMESettingsScreen } from './screens/DMESettingsScreen';

interface DMEFullLayoutProps {
  initialSection?: DMESection;
  onBack?: () => void;
}

export const DMEFullLayout: React.FC<DMEFullLayoutProps> = ({
  initialSection = 'overview',
  onBack
}) => {
  const [activeSection, setActiveSection] = useState<DMESection>(initialSection);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DMEOverviewScreen />;
      case 'library':
        return <DMELibraryScreen />;
      case 'category':
        return <DMECategoryScreen />;
      case 'health':
        return <DMEHealthScreen />;
      case 'completion':
        return <DMECompletionScreen />;
      case 'vala-ai':
        return <DMEValaAIScreen />;
      case 'urls':
        return <DMEUrlsScreen />;
      case 'security':
        return <DMESecurityScreen />;
      case 'logs':
        return <DMELogsScreen />;
      case 'settings':
        return <DMESettingsScreen />;
      default:
        return <DMEOverviewScreen />;
    }
  };

  return (
    <div className="flex h-full w-full bg-background">
      <DMESidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onBack={onBack}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default DMEFullLayout;
