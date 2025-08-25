// src/core/ai.js
import { AI_CONFIG, getHeaders } from './ai-config';
import { generateImagePublicUrl } from './image-generation';

// Universal helper to call the Gemini API
async function callGoogleGemini({ system, user, json = true }) {
  const url = `${AI_CONFIG.endpointBase}/models/${AI_CONFIG.model}:generateContent`;
  
  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    system_instruction: { parts: [{ text: system }] },
    generationConfig: { response_mime_type: json ? 'application/json' : 'text/plain' },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(AI_CONFIG.timeoutMs),
  });

  if (!response.ok) {
    let errorText = '';
    try { errorText = await response.text(); } catch {}
    throw new Error(`Google Gemini API error: ${response.status} ${response.statusText} ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from AI');
  
  return json ? JSON.parse(rawText) : rawText;
}

// Logic for generating angles
export async function generateStrategicAngles(topic, prefs = {}) {
  const system = `You are a world-class presentation strategist. Generate 3 distinct, insightful angles for a presentation. Your output must be a single, valid JSON object with an "angles" array.`;
  const user = `Generate 3 strategic angles for the topic: "${topic}". Preferences: Audience: ${prefs.audience || 'General'}, Tone: ${prefs.tone || 'Formal'}. Respond with JSON like: { "angles": [{ "angle_id": "...", "title": "...", "description": "...", "audience": "...", "emphasis_keywords": ["..."] }] }`;
  
  return await callGoogleGemini({ system, user, json: true });
}

// Logic for generating the blueprint
export async function generateBlueprint(topic, angle, slideCount = 10, prefs = {}) {
  const system = `You are a McKinsey-level presentation strategist. Create an executive-quality blueprint. Follow a strict narrative arc: Hook, Problem, Evidence, Solution, Action. Titles must be declarative statements. Bullets must be action-oriented and under 10 words. Your output must be ONLY the valid JSON matching this schema: { slides: [{ slide_id: string, slide_title: string, content_points: string[], narrative_role: "Hook"|"Problem"|"Evidence"|"Solution"|"Action" }] }`;
  const user = JSON.stringify({ topic, angle, slide_count: slideCount, ...prefs, instructions: 'Create a compelling narrative arc. Each slide must advance the story.' });

  const result = await callGoogleGemini({ system, user, json: true });
  return { topic, ...result };
}

// Logic for refining the blueprint
export async function refineBlueprint(blueprint, message, chatHistory = []) {
  const system = `You are a helpful presentation editor. The user wants to refine their blueprint. Apply their requested changes. Return the FULL, updated blueprint JSON only (no commentary). Preserve all slide_ids.`;
  const user = JSON.stringify({ blueprint, request: message, chatHistory: chatHistory.slice(-4) });
  
  return await callGoogleGemini({ system, user, json: true });
}

// Internal: design a single slide layout recipe based on a blueprint slide (with generative backgrounds)
async function generateLayoutRecipeForSlide(blueprint, slide) {
  const system = `You are an avant-garde presentation designer with a flair for creating stunning, generative visuals. Your task is to design a single slide.

  YOUR CREATIVE PROCESS:
  1.  **Analyze Content:** Read the slide title and bullet points to understand its purpose (e.g., intro, data, quote).
  2.  **Choose a Layout:** Select the BEST layout from the available list: ['TitleSlide', 'TwoColumn', 'FeatureGrid', 'Quote', 'SectionHeader'].
  3.  **Design the Background:** This is critical. You MUST design a visually interesting background.
      a.  **Choose a Base Color:** Pick a single hex color that fits the slide's mood (e.g., a deep blue for tech, a warm orange for finance).
      b.  **Choose a Background Recipe:** Select a style from this list: ['aurora', 'geometric', 'subtleNoise']. 'aurora' is great for intros, 'geometric' for data, and 'subtleNoise' for content.
      c.  Combine them in the 'theme_runtime.background' object.
  4.  **Populate Props:** Fill the 'props' for your chosen layout with the slide's content.
  5.  **Request an Image (if needed):** If you chose a visual layout like 'TwoColumn' or 'FeatureGrid', you MUST create an 'image_request' with specific, artistic keywords.

  YOUR OUTPUT MUST BE ONLY a single, valid JSON object that strictly follows this schema:
  {
    "layout_type": string,
    "props": { /* layout-specific properties */ },
    "image_request"?: { "keywords": string[] },
    "theme_runtime": {
      "background": {
        "recipeName": "aurora" | "geometric" | "subtleNoise",
        "baseColor": "#RRGGBB"
      }
    }
  }`;

  const user = JSON.stringify({
    topic: blueprint.topic,
    slide_title: slide.slide_title,
    content_points: slide.content_points,
    narrative_role: slide.narrative_role,
  });

  return await callGoogleGemini({ system, user, json: true });
}

// Public: stream slide recipes one by one
export async function* generateSlideRecipesStream(blueprint) {
  const slides = blueprint.slides || [];
  for (let i = 0; i < slides.length; i++) {
    try {
      const slideBlueprint = slides[i];
      const recipe = await generateLayoutRecipeForSlide(blueprint, slideBlueprint);

      if (recipe?.image_request?.keywords) {
        const imageUrl = await generateImagePublicUrl({ keywords: recipe.image_request.keywords });
        if (imageUrl) {
          recipe.props = recipe.props || {};
          recipe.props.imageUrl = imageUrl;
        }
      }

      recipe.slide_id = slideBlueprint.slide_id;
      yield { type: 'recipe', recipe, index: i };
    } catch (error) {
      yield { type: 'error', message: `Failed to generate slide ${i + 1}: ${error.message}`, index: i };
    }
  }
}
