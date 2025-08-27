'use client';

import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as aiService from '@/services/aiService';
import StoryArc from './StoryArc';
import AICopilotPanel from './AICopilotPanel';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';

export default function OutlineView() {
  const { isLoading, setLoading, setError, setActiveView } = useUIStore();
  const { presentation, setBlueprint, setSlideRecipes, setDesignSystem, setPresentation } = usePresentationStore();

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
    const slideCount = presentation?.blueprint?.slides?.length || 0;
    // Pre-fill placeholders to guarantee array length for the UI
    setSlideRecipes(Array(slideCount).fill(null));

    await aiService.generateSlideRecipesStream({
      blueprint: presentation.blueprint,
      topic: presentation.topic,
      angle: presentation.chosenAngle,
      onEvent: (event) => {
        if (event.type === 'design_system') {
          // store the theme/design system for use by Deck/ThemeProvider in future
          if (setDesignSystem) setDesignSystem(event.designSystem);
          else setPresentation({ designSystem: event.designSystem });
        } else if (event.type === 'recipe') {
          if (typeof event.index === 'number') {
            // Highly reactive update using Zustand's core setState to avoid stale closures
            usePresentationStore.setState((state) => {
              const current = state.presentation?.slideRecipes || [];
              const next = current && current.length ? [...current] : Array(slideCount).fill(null);
              next[event.index] = event.recipe;
              return {
                presentation: {
                  ...state.presentation,
                  slideRecipes: next,
                },
              };
            });
          }
        } else if (event.type === 'error') {
          setError(event.message);
        }
      },
      onDone: () => {
        // Optional compaction if desired to remove null placeholders:
        // usePresentationStore.setState((state) => ({
        //   presentation: {
        //     ...state.presentation,
        //     slideRecipes: state.presentation.slideRecipes.filter(Boolean),
        //   },
        // }));
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
            <StoryArc blueprint={presentation.blueprint} />
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
