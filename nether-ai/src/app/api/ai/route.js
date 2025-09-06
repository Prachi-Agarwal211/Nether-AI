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

// Helper to create a streaming SSE response from an async generator
function createStreamingResponse(iterator) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        const payload = `data: ${JSON.stringify(value)}\n\n`;
        controller.enqueue(encoder.encode(payload));
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

export async function POST(req) {
  try {
    ensureApiKey();
    const { action, payload } = await req.json();

    if (!action || !payload) {
      return NextResponse.json({ error: 'Missing action or payload' }, { status: 400 });
    }

    // Streaming slide recipe generation with design system first (then parallel slide recipe generation)
    if (action === 'generate_recipes_stream') {
      const { blueprint, topic, angle, selectedTheme } = payload;

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          let isClosed = false;
          const push = (event) => {
            if (!isClosed) {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              } catch (error) {
                console.error('[API] Controller enqueue error:', error);
                isClosed = true;
              }
            }
          };
          
          try {
            // Stage 1: Use selected theme or generate new one
            let designSystem = selectedTheme;
            
            if (!designSystem && topic && angle) {
              console.log('[API] Generating new design system...');
              designSystem = await AiCore.generateDesignSystem(topic, angle);
              console.log('--- AI-GENERATED DESIGN BRIEF ---', JSON.stringify(designSystem, null, 2));
              push({ type: 'design_system', designSystem });
              
              // Save new themes (non-blocking)
              if (designSystem) {
                saveThemeToDatabase(designSystem).catch(console.error);
              }
            } else if (designSystem) {
              console.log('[API] Using selected theme');
              push({ type: 'design_system', designSystem });
            }

            // Stages 2 & 3: Parallel slide recipe generation (theme-aware)
            const slides = blueprint?.slides || [];
            console.log(`[API] Stage 2: Starting generation for ${slides.length} slides in parallel.`);
            const t = blueprint?.topic || topic;
            const promises = slides.map((slideBlueprint, index) =>
              AiCore.generateRecipeForSlide(slideBlueprint, t, designSystem)
                .then(async (recipe) => {
                  // Optional image generation
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
                  push({ type: 'recipe', recipe, index });
                  console.log(`[API] Successfully generated recipe for slide ${index + 1}`);
                  return recipe;
                })
                .catch((error) => {
                  console.error(`[API] FAILED to generate recipe for slide ${index + 1}:`, error);
                  push({ type: 'error', message: `Failed on slide ${index + 1}: ${error.message}`, index });
                  const fallback = {
                    layout_type: 'FallbackLayout',
                    props: {
                      title: `Error Generating Slide ${index + 1}`,
                      errorMessage: 'The AI failed to create content for this slide. You can retry or refine your outline.'
                    },
                    slide_id: slideBlueprint?.slide_id || `error_${index}_${Date.now()}`,
                  };
                  push({ type: 'recipe', recipe: fallback, index });
                  return fallback;
                })
            );

            await Promise.all(promises);
            console.log('[API] Stage 2 & 3: All slide generations settled.');
          } catch (error) {
            console.error('[API] FATAL STREAM ERROR:', error);
            push({ type: 'error', message: `Stream error: ${error.message}` });
          } finally {
            console.log('[API] Closing stream.');
            if (!isClosed) {
              try {
                controller.close();
                isClosed = true;
              } catch (error) {
                console.error('[API] Controller close error:', error);
              }
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
        result = await AiCore.generateStrategicAngles(payload.topic, payload);
        break;

      case 'generate_blueprint':
        result = await AiCore.generateBlueprint(payload.topic, payload.angle, payload.slideCount, payload);
        break;

      case 'refine_blueprint':
        result = await AiCore.refineBlueprint(payload.blueprint, payload.message, payload.chatHistory);
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
