// src/app/api/ai/route.js
import { NextResponse } from 'next/server';
import * as AiCore from '@/core/ai';

// The new route.js file, which is much simpler
export async function POST(req) {
  try {
    // A helpful check to ensure the environment variable is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY environment variable. Please configure it in your .env.local file.' }, { status: 500 });
    }

    const { action, payload } = await req.json();
    let result;

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
    
    // The result from Vercel AI SDK's `generateObject` is already a JSON object.
    return NextResponse.json(result);

  } catch (err) {
    // Log the full error for better debugging on the server
    console.error('[AI_ROUTE_ERROR]', err);
    return NextResponse.json({ error: err?.message || 'An unexpected error occurred in the AI route.' }, { status: 500 });
  }
}