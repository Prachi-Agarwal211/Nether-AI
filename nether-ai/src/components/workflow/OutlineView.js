'use client';

import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as aiService from '@/services/aiService';
import BlueprintDisplay from './BlueprintDisplay';
import AICopilotPanel from './AICopilotPanel';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';

export default function OutlineView() {
  const { isLoading, setLoading, setError, setActiveView } = useUIStore();
  const { presentation, setBlueprint, setSlideRecipes } = usePresentationStore();

  const handleRefineBlueprint = async (message, chatHistory) => {
    setLoading(true);
    try {
      const updatedBlueprint = await aiService.refineBlueprint(presentation.blueprint, message, chatHistory);
      setBlueprint(updatedBlueprint);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDesignPresentation = async () => {
    setLoading(true);
    setActiveView('deck'); // Optimistically show deck while slides stream in

    const progressive = [];

    await aiService.generateSlideRecipesStream({
      blueprint: presentation.blueprint,
      onRecipe: (recipe, index) => {
        progressive[index] = recipe;
        setSlideRecipes([...progressive]);
      },
      onError: (msg) => {
        setError(msg);
      },
      onDone: () => {
        setSlideRecipes(progressive.filter(Boolean));
        setLoading(false);
      },
    });
  };

  return (
    <div className="w-full max-w-full mx-auto h-[calc(100vh-150px)] relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
          <motion.div
            className="h-full bg-white/70"
            initial={{ x: '-50%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '50%' }}
          />
        </div>
      )}
      <PanelGroup direction="horizontal">
        <Panel defaultSize={65} minSize={40}>
          <div className="h-full overflow-y-auto pr-6 p-4">
            <BlueprintDisplay blueprint={presentation.blueprint} />
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 bg-white/10 hover:bg-white/20 transition-colors" />
        <Panel defaultSize={35} minSize={30}>
          <div className="h-full pl-6 p-4">
            <AICopilotPanel
              onRefine={handleRefineBlueprint}
              onFinalize={handleDesignPresentation}
              isProcessing={isLoading}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
