'use client';

import { useUIStore } from '@/store/useUIStore';
import IdeaView from '@/components/workflow/IdeaView';
import OutlineView from '@/components/workflow/OutlineView';
import DeckView from '@/components/workflow/DeckView';
import TemplatesView from '@/components/workflow/TemplatesView';

export default function DashboardPage() {
  const { activeView } = useUIStore();

  const renderActiveView = () => {
    switch (activeView) {
      case 'templates':
        return <TemplatesView />;
      case 'outline':
        return <OutlineView />;
      case 'deck':
        return <DeckView />;
      case 'idea':
      default:
        return <IdeaView />;
    }
  };

  return <>{renderActiveView()}</>;
}
