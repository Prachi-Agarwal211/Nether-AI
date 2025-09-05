'use client';

import { useUIStore } from '@/store/useUIStore';
import { usePresentationStore } from '@/store/usePresentationStore';
import * as aiService from '@/services/aiService';
import StoryArc from './StoryArc';
import AICopilotPanel from './AICopilotPanel';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function OutlineView() {
  const { isLoading, setLoading, setError, setActiveView } = useUIStore();
  const { presentation, setBlueprint, setSlideRecipes, setDesignSystem, setPresentation } = usePresentationStore();

  const handleRefineBlueprint = async (message, chatHistory) => {
    setLoading(true);
    try {
      const updatedBlueprint = await aiService.refineBlueprint(presentation.blueprint, message, chatHistory);
      setBlueprint(updatedBlueprint);
      toast.success("Blueprint refined successfully!");
    } catch (e) {
      setError(e.message);
      toast.error(`Failed to refine blueprint: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDesignPresentation = async () => {
    setLoading(true);
    setActiveView('deck');
    const slideCount = presentation?.blueprint?.slides?.length || 0;
    setSlideRecipes(Array(slideCount).fill(null));

    await aiService.generateSlideRecipesStream({
      blueprint: presentation.blueprint,
      topic: presentation.topic,
      angle: presentation.chosenAngle,
      onEvent: (event) => {
        if (event.type === 'design_system') {
          if (setDesignSystem) setDesignSystem(event.designSystem);
          else setPresentation({ designSystem: event.designSystem });
        } else if (event.type === 'recipe') {
          if (typeof event.index === 'number') {
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
          toast.error(`Slide generation error: ${event.message}`);
        }
      },
      onDone: () => {
        setLoading(false);
        toast.success("Presentation designed successfully!");
      },
    });
  };

  return (
    <div className="w-full h-full relative bg-black/20 p-4">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden z-20">
          <motion.div
            className="h-full bg-white/70"
            initial={{ x: '-50%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '50%' }}
          />
        </div>
      )}
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={60} minSize={40}>
          <div className="h-full w-full pr-2">
            <StoryArc blueprint={presentation.blueprint} />
          </div>
        </Panel>
        <PanelResizeHandle className="w-2.5 flex items-center justify-center bg-transparent group">
            <div className="w-1 h-16 bg-white/10 group-hover:bg-white/20 rounded-full transition-colors" />
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={30}>
          <div className="h-full w-full pl-2">
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
