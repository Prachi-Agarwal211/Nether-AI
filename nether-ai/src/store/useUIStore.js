import { create } from 'zustand';

/**
 * @typedef {'idea' | 'outline' | 'deck'} ViewMode
 */

export const useUIStore = create((set) => ({
  activeView: 'idea',
  isLoading: false,
  error: null,
  isSidebarOpen: false,

  // Actions
  setActiveView: (view) => set({ activeView: view }),
  setLoading: (isLoading) => set({ isLoading, error: null }), // Clear error on new loading state
  setError: (error) => set({ error, isLoading: false }), // Clear loading on error
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
