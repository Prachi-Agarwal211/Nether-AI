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
        const agendaTitles = blueprint.slides.slice(2).map(slide => slide.slide_title);
        if (blueprint.slides[1] && blueprint.slides[1].visual_element.type === 'Agenda') {
          console.log('[API] Dynamically injecting agenda with titles:', agendaTitles);
          blueprint.slides[1].slide_summary = "This presentation will cover: " + agendaTitles.join(', ');
          blueprint.slides[1].content_points = agendaTitles;
        }
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const push = (event) => {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            } catch (e) { console.error('Stream push error:', e); }
          };

          try {
            // Generate design system ONCE before processing slides
            let designSystem = selectedTheme;
            if (!designSystem) {
              console.log('[API Stream] Stage 1: Generating design system...');
              designSystem = await AiCore.generateDesignSystem(topic, angle);
              push({ type: 'design_system', designSystem });
              saveThemeToDatabase(designSystem).catch(console.error);
            } else {
              console.log('[API Stream] Stage 1: Using selected theme');
              push({ type: 'design_system', designSystem });
            }

            // Process all slides with the same design system
            const slides = blueprint?.slides || [];
            const t = blueprint?.topic || topic;
            console.log(`[API Stream] Stage 2: Generating ${slides.length} slides`);

            const promises = slides.map((slideBlueprint, index) => {
              return AiCore.generateRecipeForSlide(slideBlueprint, t, designSystem, context)
                .then(async (recipe) => {
                  if (recipe?.image_prompt) {
                    try {
                      const kws = String(recipe.image_prompt).split(/\s+/).filter(Boolean);
                      const imageUrl = await AiCore.generateImagePublicUrl({ keywords: kws });
                      if (imageUrl) recipe.props = { ...recipe.props, imageUrl };
                    } catch (_) { /* ignore */ }
                  }
                  recipe.slide_id = slideBlueprint.slide_id;
                  push({ type: 'recipe', recipe, index });
                  return recipe;
                })
                .catch((error) => {
                  console.error(`[API Stream] Slide ${index + 1} error:`, error);
                  push({ type: 'error', message: error.message, index });
                  return {
                    layout_type: 'FallbackLayout',
                    props: { errorMessage: error.message },
                    slide_id: `error_${index}`
                  };
                });
            });

            await Promise.all(promises);
            console.log('[API Stream] Generation complete');
          } catch (error) {
            console.error('[API Stream] Fatal error:', error);
            push({ type: 'error', message: error.message });
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive'
        }
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