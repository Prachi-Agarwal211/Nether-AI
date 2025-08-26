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
  const system = `You are a presentation strategist who excels at simplifying topics into clear, understandable narratives. Your goal is to help a user choose a story to tell. You MUST generate 4 distinct angles. Your output must be a single, valid JSON object with an "angles" array, and nothing else.`;

  const user = `
Generate 4 strategic angles for a presentation on the topic: "${topic}".

Follow these rules strictly:
1. The angles should represent common storytelling paths: The History, The Product/Brand, The Competition/Market, The Future (adapt to the topic as needed).
2. The "title" for each angle must be short, clear, and compelling.
3. The "key_points" for each angle MUST be an array of 2-3 short, easy-to-understand strings. Do NOT use long paragraphs.

Respond with a valid JSON object matching this exact schema example (structure only; adapt content to the topic):
{
  "angles": [
    {
      "angle_id": "angle_1_history",
      "title": "The Innovation Story",
      "key_points": [
        "A concise origin-to-now journey.",
        "Spotlight 1-2 pivotal product or idea milestones.",
        "What changed for users or the market."
      ]
    },
    {
      "angle_id": "angle_2_brand",
      "title": "The Power of the Brand",
      "key_points": [
        "What the brand stands for in one sentence.",
        "Signature experience or community element.",
        "Why people choose it over alternatives."
      ]
    },
    {
      "angle_id": "angle_3_market",
      "title": "The Competitive Landscape",
      "key_points": [
        "Where it fits in the market.",
        "1-2 differentiators vs competition.",
        "Opportunity or threat to watch."
      ]
    },
    {
      "angle_id": "angle_4_future",
      "title": "What Comes Next",
      "key_points": [
        "Near-term roadmap or direction.",
        "Emerging tech or trends to leverage.",
        "Risks and how to address them."
      ]
    }
  ]
}`;

  return await callGoogleGemini({ system, user, json: true });
}

// Logic for generating the blueprint
export async function generateBlueprint(topic, angle, slideCount = 10, prefs = {}) {
  const system = `You are a world-class presentation designer and storyteller. Your task is to create a complete visual and narrative blueprint for a presentation of exactly ${slideCount} slides.

  RULES:
  1.  **Structure is Mandatory:** The blueprint MUST begin with a 'Title' slide and an 'Agenda' slide, and end with a 'Closing' or 'Q&A' slide.
  2.  **Angle-Adapted Narrative:** You MUST adapt the narrative flow of the content slides to fit the chosen angle's title: "${angle?.title || ''}".
      - If the angle is historical (e.g., "The Innovation Story"), use a chronological flow.
      - If the angle is persuasive (e.g., "Why We Will Win"), use a Problem/Solution flow.
      - If the angle is explanatory (e.g., "A Guide to our Products"), use a thematic or sequential flow.
  3.  **Visual Design is Key:** For EACH slide, you MUST specify a 'visual_element'. This tells the designer HOW to lay out the content. You are not required to suggest an image for every slide. A well-structured text layout is also a visual element.
  4.  **Available Visual Elements:** ['TitleLayout', 'AgendaLayout', 'ThreeColumnText', 'TwoColumnTextAndImage', 'TimelineDiagram', 'HubAndSpokeDiagram', 'QuoteLayout', 'KeyStatsInfographic', 'ClosingLayout'].

  Your output MUST be ONLY the valid JSON object matching this exact schema:
  {
    "slides": [{
      "slide_id": "string",
      "slide_title": "string",
      "objective": "string",
      "content_points": ["string"],
      "visual_element": {
        "type": "string",
        "image_suggestion"?: "string"
      }
    }]
  }`;

  const user = `Create a blueprint for the topic: "${topic}", following the chosen angle: "${angle?.title || ''}". The presentation must have exactly ${slideCount} slides.`;

  const result = await callGoogleGemini({ system, user, json: true });
  return { topic, ...result };
}

// Logic for refining the blueprint
export async function refineBlueprint(blueprint, message, chatHistory = []) {
  const system = `You are a helpful presentation editor. The user wants to refine their blueprint. Apply their requested changes. Return the FULL, updated blueprint JSON only (no commentary). Preserve all slide_ids.`;
  const user = JSON.stringify({ blueprint, request: message, chatHistory: chatHistory.slice(-4) });
  
  return await callGoogleGemini({ system, user, json: true });
}

// Internal: design a single slide layout recipe based on a blueprint slide
async function generateLayoutRecipeForSlide(blueprint, slide) {
  const system = `You are an elite Art Director and a witty Copywriter rolled into one. Your task is to design a single, compelling presentation slide based on a blueprint.

  YOUR CREATIVE PROCESS:
  1.  **Analyze Content & Objective:** Understand the core message and the 'objective' of the slide.
  2.  **Choose the PERFECT Layout:** Select the best layout from the list to tell this part of the story: ['TitleSlide', 'TwoColumn', 'Quote', 'SectionHeader', 'FeatureGrid', 'Agenda', 'KeyTakeaways'].
  3.  **Write Compelling Props:** Populate the 'props' for your chosen layout. This is critical.
      - A 'TwoColumn' layout MUST have both a 'title' and 'bullets'.
      - A 'FeatureGrid' MUST have an array of 'features', each with a 'title', 'description', and a relevant 'icon' name from this list: ['Zap', 'BarChart', 'Rocket', 'Users', 'Code', 'Shield'].
      - A 'TitleSlide' should have a 'title' and a 'subtitle'.
  4.  **Design a Generative Background:** Create an artistic 'theme_runtime.background' by picking a 'baseColor' (hex) and a 'recipeName' from ['aurora', 'geometric', 'subtleNoise']. 
  5.  **Request a Supporting Image (If Needed):** For visual layouts like 'TwoColumn', you MUST create an 'image_request' with artistic, non-generic keywords. Think "cinematic, abstract, vibrant," not "business people meeting."
  6.  **Write Speaker Notes:** You MUST provide brief, insightful 'speaker_notes' (2-3 sentences) to guide the presenter.

  YOUR OUTPUT MUST BE ONLY a single, valid JSON object that strictly follows this schema:
  {
    "layout_type": "string",
    "props": {
      "title"?: "string",
      "subtitle"?: "string",
      "body"?: "string",
      "bullets"?: ["string"],
      "features"?: [{ "icon": "string", "title": "string", "description": "string" }],
      "quote"?: "string",
      "author"?: "string"
    },
    "image_request"?: { "keywords": ["string"] },
    "speaker_notes": "string",
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
    objective: slide.objective,
    content_points: slide.content_points,
    narrative_role: slide.narrative_role,
  });

  const recipe = await callGoogleGemini({ system, user, json: true });
  if (!recipe.speaker_notes) {
    recipe.speaker_notes = 'Remember to speak clearly and engage with the audience on this slide.';
  }
  return recipe;
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
