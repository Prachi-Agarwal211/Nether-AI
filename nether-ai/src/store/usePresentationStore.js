import { create } from 'zustand';

const initialState = {
  id: null,
  topic: '',
  strategicAngles: [],
  chosenAngle: null,
  slideCount: 10,
  blueprint: null,
  slideRecipes: [],
  themeRuntime: null,
  designSystem: null,
  activeSlideIndex: 0,
};

export const usePresentationStore = create((set) => ({
  presentation: initialState,

  // Actions
  resetPresentation: () => set({ presentation: initialState }),
  setPresentation: (data) => set((state) => ({ presentation: { ...state.presentation, ...data } })),
  setTopic: (topic) => set((state) => ({ presentation: { ...state.presentation, topic } })),
  setStrategicAngles: (angles) => set((state) => ({ presentation: { ...state.presentation, strategicAngles: angles } })),
  setChosenAngle: (angle) => set((state) => ({ presentation: { ...state.presentation, chosenAngle: angle } })),
  setBlueprint: (blueprint) => set((state) => ({ presentation: { ...state.presentation, blueprint } })),
  setSlideCount: (slideCount) => set((state) => ({ presentation: { ...state.presentation, slideCount } })),
  setSlideRecipes: (recipes) => set((state) => ({ presentation: { ...state.presentation, slideRecipes: recipes, activeSlideIndex: 0 } })),
  setDesignSystem: (designSystem) => set((state) => ({ presentation: { ...state.presentation, designSystem } })),
  setActiveSlideIndex: (index) => set((state) => {
    const lastIndex = Math.max(0, (state.presentation.slideRecipes?.length || 1) - 1);
    const newIndex = Math.max(0, Math.min(index, lastIndex));
    return { presentation: { ...state.presentation, activeSlideIndex: newIndex } };
  }),
}));
