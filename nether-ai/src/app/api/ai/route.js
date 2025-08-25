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

    // Streaming slide recipe generation
    if (action === 'generate_recipes_stream') {
      const iterator = AiCore.generateSlideRecipesStream(payload.blueprint);
      return createStreamingResponse(iterator);
    }

    let result;
    switch (action) {
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
