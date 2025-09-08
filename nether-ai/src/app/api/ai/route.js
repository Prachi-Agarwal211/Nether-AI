// src/app/api/ai/route.js
import { NextResponse } from 'next/server';
import * as AiCore from '@/core/ai';
import { ensureApiKey } from '@/core/ai-config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be set in environment variables');
  throw new Error('Supabase configuration missing');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to save theme to Supabase (non-blocking)
async function saveThemeToDatabase(designSystem) {
  try {
    if (!designSystem?.themeName) return;
    
    const { error } = await supabase
      .from('themes')
      .insert({
        theme_name: designSystem.themeName,
        design_brief: designSystem,
        preview_colors: designSystem.previewColors || {
          bg: designSystem.colorPalette?.background?.default || '#000000',
          text: designSystem.colorPalette?.text?.primary || '#ffffff',
          accent: designSystem.colorPalette?.primary?.main || '#3b82f6'
        },
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('[Supabase] Failed to save theme:', error);
    } else {
      console.log('[Supabase] Theme saved successfully');
    }
  } catch (e) {
    console.error('[Supabase] Error saving theme:', e);
  }
}

export async function POST(req) {
  try {
    ensureApiKey();
    const { action, payload } = await req.json();

    if (!action || !payload) {
      return NextResponse.json({ error: 'Missing action or payload' }, { status: 400 });
    }

    const context = {
        audience: payload.audience,
        tone: payload.tone,
        objective: payload.objective,
    };

    if (action === 'generate_recipes_stream') {
      console.log('[API] Received request for generate_recipes_stream');
      let { blueprint, topic, angle, selectedTheme } = payload;

      // --- DYNAMIC AGENDA GENERATION LOGIC ---
      if (blueprint && blueprint.slides && blueprint.slides.length > 2) {
        // Extract titles from all slides *after* the Agenda slide
        const agendaTitles = blueprint.slides.slice(2).map(slide => slide.slide_title);
        
        // Find the Agenda slide (should be at index 1) and inject the titles into its summary
        if (blueprint.slides[1] && blueprint.slides[1].visual_element.type === 'Agenda') {
          console.log('[API] Dynamically injecting agenda with titles:', agendaTitles);
          // Create a summary from the titles for the AI to work with
          blueprint.slides[1].slide_summary = "This is the agenda for the presentation. It will cover the following topics: " + agendaTitles.join(', ');
          // We can also add the raw points if the layout needs them
          blueprint.slides[1].content_points = agendaTitles;
        }
      }
      // --- END OF AGENDA LOGIC ---

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          console.log('[API Stream] Starting generation process...');
          let isClosed = false;
          const push = (event) => {
            if (!isClosed) {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              } catch (error) {
                console.error('[API Stream] Controller enqueue error:', error);
                isClosed = true;
              }
            }
          };
          
          try {
            let designSystem = selectedTheme;
            
            if (!designSystem && topic && angle) {
              console.log('[API Stream] Stage 1: Generating new design system...');
              designSystem = await AiCore.generateDesignSystem(topic, angle);
              console.log('[API Stream] Stage 1: Design system generated.');
              push({ type: 'design_system', designSystem });
              if (designSystem) {
                saveThemeToDatabase(designSystem).catch(console.error);
              }
            } else if (designSystem) {
              console.log('[API Stream] Stage 1: Using selected theme.');
              push({ type: 'design_system', designSystem });
            }

            const slides = blueprint?.slides || [];
            console.log(`[API Stream] Stage 2: Starting generation for ${slides.length} slides in parallel.`);
            const t = blueprint?.topic || topic;
            const promises = slides.map((slideBlueprint, index) => {
              console.log(`[API Stream] Generating recipe for slide ${index + 1}...`);
              return AiCore.generateRecipeForSlide(slideBlueprint, t, designSystem, context)
                .then(async (recipe) => {
                  if (recipe?.image_prompt) {
                    try {
                      const kws = String(recipe.image_prompt).split(/\s+/).filter(Boolean);
                      const imageUrl = await AiCore.generateImagePublicUrl({ keywords: kws });
                      if (imageUrl) {
                        recipe.props = recipe.props || {};
                        recipe.props.imageUrl = imageUrl;
                      }
                    } catch (_) { /* ignore image errors per slide */ }
                  }
                  recipe.slide_id = slideBlueprint.slide_id;
                  console.log(`[API Stream] Successfully generated recipe for slide ${index + 1}`);
                  push({ type: 'recipe', recipe, index });
                  return recipe;
                })
                .catch((error) => {
                  console.error(`[API Stream] FAILED to generate recipe for slide ${index + 1}:`, error.message);
                  push({ type: 'error', message: `Failed on slide ${index + 1}: ${error.message}`, index });
                  const fallback = {
                    layout_type: 'FallbackLayout',
                    props: { title: `Error Generating Slide ${index + 1}`, errorMessage: error.message },
                    slide_id: slideBlueprint?.slide_id || `error_${index}_${Date.now()}`,
                  };
                  push({ type: 'recipe', recipe: fallback, index });
                  return fallback;
                });
            });

            await Promise.all(promises);
            console.log('[API Stream] Stage 2 & 3: All slide generations settled.');
          } catch (error) {
            console.error('[API Stream] FATAL STREAM ERROR:', error);
            push({ type: 'error', message: `Stream error: ${error.message}` });
          } finally {
            console.log('[API Stream] Closing stream.');
            if (!isClosed) {
              try { controller.close(); isClosed = true; } catch (error) { /* ignore */ }
            }
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    let result;
    switch (action) {
      case 'converse':
        result = await AiCore.haveConversation(payload.chatHistory);
        break;
        
      case 'generate_angles':
        result = await AiCore.generateStrategicAngles(payload.topic, context);
        break;

      case 'generate_blueprint':
        result = await AiCore.generateBlueprint(payload.topic, payload.angle, payload.slideCount, context);
        break;

      case 'refine_blueprint':
        result = await AiCore.refineBlueprint(payload.blueprint, payload.message, payload.chatHistory);
        break;
      
      case 'refine_slide':
        result = await AiCore.refineSlideRecipe(payload.slideRecipe, payload.message);
        break;

      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (err) {
    console.error('[AI_API_ERROR]', err);
    return NextResponse.json({ error: err.message || 'An unexpected AI error occurred.' }, { status: 500 });
  }
}