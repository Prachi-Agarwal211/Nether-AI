// src/app/api/ai/route.js
import { NextResponse } from 'next/server';
import * as AiCore from '@/core/ai';
import { ensureApiKey } from '@/core/ai-config';

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
      const { blueprint, topic, angle } = payload;

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
            // Stage 1: Brand Director — generate design system
            let designSystem = null;
            if (topic && angle) {
              console.log('[API] Stage 1: Generating Design System...');
              designSystem = await AiCore.generateDesignSystem(topic, angle);
              push({ type: 'design_system', designSystem });
              console.log('[API] Stage 1: Design System sent.');
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
