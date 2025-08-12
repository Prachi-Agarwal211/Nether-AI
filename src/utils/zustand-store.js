"use client";

import { create } from "zustand";
import { createClient } from "@/utils/supabase-client";
import { devtools, persist } from "zustand/middleware";

// Types for better IDE support
/** @typedef {'idea' | 'outline' | 'deck'} ViewMode */

/**
 * @typedef {Object} Presentation
 * @property {string | null} id
 * @property {string} topic
 * @property {Array<{id: string, title: string, description: string}>} strategicAngles
 * @property {string | null} chosenAngle
 * @property {number} slideCount
 * @property {any | null} blueprint
 * @property {Array<any>} slideRecipes
 * @property {number} activeSlideIndex
 */

/**
 * @typedef {Object} AppState
 * @property {ViewMode} activeView
 * @property {boolean} isLoading
 * @property {string | null} error
 * @property {Presentation} presentation
 * @property {Array<any>} history
 * @property {Array<{role: string, content: string}>} chatHistory
 * @property {NodeJS.Timeout | null} _autosaveTimer
 */

const initialState = {
  activeView: "idea",
  isLoading: false,
  error: null,
  presentation: {
    id: null,
    topic: "",
    strategicAngles: [],
    chosenAngle: null,
    slideCount: 10,
    blueprint: null,
    slideRecipes: [],
    themeRuntime: null,
    activeSlideIndex: 0,
  },
  history: [],
  chatHistory: [],
  _autosaveTimer: null,
};

/**
 * Creates the Zustand store with middleware
 */
export const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // UI Actions
        setActiveView: (view) => set({ activeView: view }),
        setError: (error) => set({ error }),
        setLoading: (isLoading) => set({ isLoading }),

        // Presentation Actions
        setActiveSlideIndex: (index) => {
          const { presentation } = get();
          const lastIndex = Math.max(0, (presentation.slideRecipes?.length || 1) - 1);
          const newIndex = Math.max(0, Math.min(index, lastIndex));
          
          set(state => ({
            presentation: {
              ...state.presentation,
              activeSlideIndex: newIndex,
            },
          }));
        },

        // History Management
        loadHistory: async () => {
          const supabase = createClient();
          set({ isLoading: true });
          
          try {
            const { data, error } = await supabase
              .from('presentations')
              .select('id, topic, updated_at, status')
              .order('updated_at', { ascending: false })
              .limit(50);
              
            if (error) throw error;
            
            set({ 
              history: data || [],
              isLoading: false 
            });
            return data;
          } catch (error) {
            console.error('Failed to load history:', error);
            set({ 
              error: 'Failed to load presentation history',
              isLoading: false,
              history: [] 
            });
            return [];
          }
        },

        // Data Persistence
        savePresentation: async () => {
          const { presentation, activeView } = get();
          const supabase = createClient();
          
          const status = {
            deck: 'deck',
            outline: 'outline',
            idea: 'idea'
          }[activeView] || 'draft';
          
          const payload = {
            id: presentation.id || undefined,
            topic: presentation.topic,
            chosen_angle: presentation.chosenAngle,
            slide_count: presentation.slideCount,
            blueprint: presentation.blueprint,
            recipes: presentation.slideRecipes,
            updated_at: new Date().toISOString(),
            status,
          };
          
          try {
            const { data, error } = await supabase
              .from('presentations')
              .upsert(payload)
              .select('id')
              .single();
              
            if (error) throw error;
            
            // Update local ID if this is a new presentation
            if (data?.id && !presentation.id) {
              set(state => ({
                presentation: {
                  ...state.presentation,
                  id: data.id,
                },
              }));
            }
            
            return data?.id || presentation.id;
          } catch (error) {
            console.error('Autosave failed:', error);
            // Non-blocking - user can continue working
            return presentation.id;
          }
        },
        
        // Debounced autosave
        _scheduleAutosave: () => {
          const { _autosaveTimer } = get();
          
          if (_autosaveTimer) {
            clearTimeout(_autosaveTimer);
          }
          
          const timer = setTimeout(() => {
            get().savePresentation();
            set({ _autosaveTimer: null });
          }, 2000); // 2 second debounce
          
          set({ _autosaveTimer: timer });
        },

        // AI Generation Actions
        generateAngles: async (topic) => {
          if (!topic?.trim()) {
            set({ error: 'Topic is required' });
            return [];
          }
          
          set({ 
            isLoading: true, 
            error: null,
            presentation: {
              ...get().presentation,
              topic: topic.trim(),
            },
          });
          
          try {
            const response = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                action: "generate_angles", 
                payload: { topic: topic.trim() } 
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to generate angles");
            }
            
            const data = await response.json();
            const angles = data.angles || [];
            
            set(state => ({
              isLoading: false,
              presentation: {
                ...state.presentation,
                strategicAngles: angles,
              },
            }));
            
            return angles;
          } catch (error) {
            console.error('Error generating angles:', error);
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to generate angles' 
            });
            return [];
          }
        },

        chooseAngleAndBuildBlueprint: async (angle) => {
          const { presentation } = get();
          
          if (!angle) {
            set({ error: 'Angle is required' });
            return null;
          }
          
          // Optimistic update
          set({
            activeView: "outline",
            isLoading: true,
            error: null,
            presentation: {
              ...presentation,
              chosenAngle: angle,
              blueprint: null,
            },
          });
          
          try {
            const response = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "generate_blueprint",
                payload: { 
                  topic: presentation.topic, 
                  angle, 
                  slideCount: presentation.slideCount 
                },
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to generate blueprint");
            }
            
            const data = await response.json();
            
            // Update state with new blueprint
            set(state => ({
              isLoading: false,
              presentation: {
                ...state.presentation,
                blueprint: data,
              },
            }));
            
            // Save to database in the background
            get().savePresentation().catch(console.error);
            
            return data;
          } catch (error) {
            console.error('Error generating blueprint:', error);
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to generate presentation outline' 
            });
            return null;
          }
        },


        // Media Handling
        uploadAttachment: async (file, slideId) => {
          const { presentation } = get();
          
          if (!presentation.id) {
            throw new Error("Presentation must be saved before uploading attachments");
          }
          
          if (!file || !slideId) {
            throw new Error("File and slide ID are required");
          }
          
          set({ isLoading: true });
          
          try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${presentation.id}/${slideId}/${fileName}`;
            
            // Upload file to storage
            const { error: uploadError } = await supabase.storage
              .from('presentation-assets')
              .upload(filePath, file);
              
            if (uploadError) throw uploadError;
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('presentation-assets')
              .getPublicUrl(filePath);
            
            // Create attachment object
            const newAttachment = {
              id: `att-${Date.now()}`,
              type: file.type.startsWith('image/') ? 'image' : 'document',
              url: publicUrl,
              name: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString(),
            };
            
            // Update state with new attachment
            set(state => {
              const updatedSlides = state.presentation.blueprint?.slides?.map(slide => {
                if (slide.slide_id === slideId) {
                  return {
                    ...slide,
                    attachments: [
                      ...(slide.attachments || []),
                      newAttachment,
                    ],
                  };
                }
                return slide;
              }) || [];
              
              return {
                presentation: {
                  ...state.presentation,
                  blueprint: {
                    ...state.presentation.blueprint,
                    slides: updatedSlides,
                  },
                },
                isLoading: false,
              };
            });
            
            // Trigger autosave
            get()._scheduleAutosave();
            
            return newAttachment;
          } catch (error) {
            console.error("Error uploading attachment:", error);
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to upload attachment' 
            });
            throw error;
          }
        },
        
        // Blueprint Management
        updateBlueprintLocal: (patch) => {
          set(state => ({
            presentation: {
              ...state.presentation,
              blueprint: {
                ...state.presentation.blueprint,
                ...patch,
                updatedAt: new Date().toISOString(),
              },
            },
          }));
          
          get()._scheduleAutosave();
        },
        
        // AI Refinement
        refineBlueprintViaChat: async (message, context = {}) => {
          const { presentation, chatHistory } = get();
          
          if (!message?.trim()) {
            set({ error: 'Message cannot be empty' });
            return null;
          }
          
          // Update chat history
          const userMessage = { 
            role: 'user', 
            content: String(message).slice(0, 1000),
            timestamp: new Date().toISOString(),
          };
          
          const newHistory = [...chatHistory, userMessage].slice(-10);
          
          set({ 
            chatHistory: newHistory, 
            isLoading: true, 
            error: null 
          });
          
          try {
            const response = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "refine_blueprint",
                payload: {
                  blueprint: presentation.blueprint,
                  chatHistory: newHistory,
                  context,
                },
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to refine blueprint");
            }
            
            const data = await response.json();
            const assistantMessage = { 
              role: 'assistant', 
              content: 'Applied changes to the presentation',
              timestamp: new Date().toISOString(),
            };
            
            // Update state with refined blueprint
            set(state => ({
              isLoading: false,
              presentation: {
                ...state.presentation,
                blueprint: data,
              },
              chatHistory: [...newHistory, assistantMessage].slice(-10),
            }));
            
            // Save in background
            get().savePresentation().catch(console.error);
            
            return data;
          } catch (error) {
            console.error('Error refining blueprint:', error);
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to refine presentation' 
            });
            return null;
          }
        },
        
        // Slide Generation (Streaming)
        generateRecipes: async () => {
          const { presentation } = get();
          
          if (!presentation.blueprint) {
            set({ error: 'Please create a presentation outline first' });
            return;
          }
          
          // Immediately switch to deck and clear prior recipes to avoid flashing old slides
          set({ 
            isLoading: 'Preparing AI generation...', 
            error: null,
            activeView: 'deck',
            presentation: {
              ...presentation,
              slideRecipes: [],
            },
          });
          
          try {
            const response = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                action: "generate_recipes_stream", 
                payload: { 
                  blueprint: presentation.blueprint,
                } 
              }),
            });

            if (!response || !response.body) {
              throw new Error('Streaming response not available.');
            }

            const totalSlides = Array.isArray(presentation.blueprint?.slides) ? presentation.blueprint.slides.length : 0;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';
            let generatedCount = 0;

            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              if (value) buffer += decoder.decode(value, { stream: true });

              let idx;
              while ((idx = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 1);
                if (!line) continue;
                if (line.startsWith('data: ')) {
                  const jsonString = line.slice(6);
                  if (!jsonString) continue;
                  try {
                    const data = JSON.parse(jsonString);
                    if (data.type === 'recipe' && data.recipe) {
                      generatedCount += 1;
                      set(state => ({
                        presentation: {
                          ...state.presentation,
                          slideRecipes: [...state.presentation.slideRecipes, data.recipe],
                          activeSlideIndex: state.presentation.slideRecipes.length,
                        },
                      }));
                      set({ isLoading: `Generating slide ${generatedCount} of ${totalSlides}...` });
                    } else if (data.type === 'theme_runtime') {
                      set(state => ({
                        presentation: {
                          ...state.presentation,
                          themeRuntime: data.theme_runtime || state.presentation.themeRuntime,
                        },
                      }));
                    } else if (data.type === 'progress' && data.message) {
                      set({ isLoading: String(data.message) });
                    }
                  } catch (e) {
                    console.error('Error parsing stream chunk:', e);
                  }
                }
              }
            }

            set({ isLoading: false });
            get().savePresentation().catch(console.error);
          } catch (error) {
            console.error('Error generating slide recipes:', error);
            set({
              isLoading: false,
              error: error.message || 'Failed to generate slide content',
            });
          }
        },

        // Export and Sharing
        exportToPPTX: async () => {
          const { presentation } = get();
          
          // Validate state
          if (!presentation.blueprint) {
            throw new Error('Please create a presentation outline first');
          }
          
          if (!presentation.slideRecipes?.length) {
            throw new Error('Please generate slide content before exporting');
          }
          
          set({ isLoading: true, error: null });
          
          try {
            const response = await fetch('/api/export-pptx', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                presentation: {
                  id: presentation.id,
                  topic: presentation.topic,
                  chosen_angle: presentation.chosenAngle,
                  slide_count: presentation.slideCount,
                  created_at: new Date().toISOString(),
                },
                slides: presentation.slideRecipes,
                theme_runtime: presentation.themeRuntime,
                theme_gds: presentation.blueprint?.theme || null,
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Export failed');
            }
            
            // Trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(presentation.topic || 'presentation')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-') // Replace special chars with -
              .replace(/(^-|-$)/g, '')} // Remove leading/trailing -
              -${new Date().toISOString().split('T')[0]}.pptx`; // Add date
              
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Track successful export
            set({ isLoading: false });
            
            return true;
          } catch (error) {
            console.error('Export failed:', error);
            set({ 
              isLoading: false, 
              error: error.message || 'Failed to export presentation' 
            });
            throw error;
          }
        },
        
        // Reset the entire store
        reset: () => set({
          ...initialState,
          // Keep any persistent settings you want to preserve
          // e.g., userPreferences: get().userPreferences,
        }),
      }),
      {
        name: 'nether-ai-presentation', // Local storage key
        partialize: (state) => ({
          // Only persist these parts of the state
          presentation: state.presentation,
          activeView: state.activeView,
          // Add any other state you want to persist
        }),
      }
    ),
    {
      name: 'NetherAI Store', // For Redux DevTools
    }
  )
);