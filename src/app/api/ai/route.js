// src/app/api/ai/route.js
import { NextResponse } from 'next/server';
import * as AiCore from '@/core/ai';

// Helper to produce a server-sent-events style stream from an async iterator
function createStreamingResponse(iterator) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
        return;
      }
      // Emit as SSE line: data: <json>\n
      const payload = `data: ${JSON.stringify(value)}\n`;
      controller.enqueue(encoder.encode(payload));
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// The new route.js file, which is much simpler
export async function POST(req) {
  try {
    // Ensure Gemini API key is configured (prefer server-side var)
    const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return NextResponse.json({ error: 'Missing GOOGLE_GEMINI_API_KEY. Please set GOOGLE_GEMINI_API_KEY (recommended) or NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY in your .env.local.' }, { status: 500 });
    }

    const { action, payload } = await req.json();
    let result;

    if (action === 'generate_recipes_stream') {
      const iterator = AiCore.generateSlideRecipesStream(payload?.blueprint || null);
      return createStreamingResponse(iterator);
    }

    switch (action) {
      case 'generate_angles':
        result = await AiCore.generateStrategicAngles(payload?.topic || '');
        break;

      case 'generate_blueprint':
        result = await AiCore.generateBlueprint(
          payload?.topic || '',
          payload?.angle || null,
          Number(payload?.slideCount || 10)
        );
        break;

      case 'refine_blueprint':
        result = await AiCore.refineBlueprintViaChat(
          payload?.blueprint || null,
          Array.isArray(payload?.chatHistory) ? payload.chatHistory : []
        );
        break;

      case 'generate_recipes':
        result = await AiCore.generateSlideRecipes(payload?.blueprint || null);
        break;

      default:
        return NextResponse.json({ error: 'Invalid AI action' }, { status: 400 });
    }
    
    // The result is a JSON object.
    return NextResponse.json(result);

  } catch (err) {
    // Log the full error for better debugging on the server
    console.error('[AI_ROUTE_ERROR]', err);
    return NextResponse.json({ error: err?.message || 'An unexpected error occurred in the AI route.' }, { status: 500 });
  }
}