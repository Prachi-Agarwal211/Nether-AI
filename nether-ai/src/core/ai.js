// src/core/ai.js
import { AI_CONFIG, getHeaders } from './ai-config';
import { generateImagePublicUrl } from './image-generation';
export { generateImagePublicUrl };

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
  4.  **Available Visual Elements:** ['TitleSlide', 'Agenda', 'TwoColumn', 'Quote', 'SectionHeader', 'FeatureGrid', 'ProcessDiagram', 'DataChart', 'Timeline', 'ComparisonTable', 'TeamMembers'].

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

/**
 * [NEW FUNCTION] Stage 1: The Brand Director AI
 * Generates a complete, cohesive design system for the entire presentation.
 */
export async function generateDesignSystem(topic, angle) {
  const system = `You are a visionary Creative Director at a top-tier design agency. Your specialty is creating stunning, futuristic, and professional brand identities for presentations. Your output must be only a single, valid JSON object.`;

  const user = `
    The presentation topic is: "${topic}".
    The chosen angle is: "${angle?.title || ''}".

    Generate a complete and cohesive Design System with a 'Futuristic-Corporate' aesthetic.

    - Color Palette: Must be sophisticated. Include a dark gradient for the background, vibrant primary/secondary colors for focus, and a bright accent for call-to-action elements.
    - Typography: Choose one bold, clean font for headings (like 'Exo 2', 'Space Grotesk', 'Montserrat') and one highly readable font for body text (like 'Inter', 'Lato', 'Roboto').
    - Style Tokens: Define properties for glassmorphism, shadows, and other visual effects. The 'glassBackgroundColor' MUST have transparency (e.g., 'rgba(255, 255, 255, 0.1)').

    Return the JSON matching this exact schema (include both legacy keys and new background variants):
    {
      "colorPalette": {
        "primary": "#RRGGBB",
        "secondary": "#RRGGBB",
        "accent": "#RRGGBB",
        "backgroundStart": "#RRGGBB",
        "backgroundEnd": "#RRGGBB",
        "textPrimary": "#RRGGBB",
        "textSecondary": "#RRGGBB"
      },
      "gradients": {
        "titleGradient": "linear-gradient(90deg, [primary], [secondary])",
        "backgroundGradient": "linear-gradient(160deg, [backgroundStart], [backgroundEnd])",
        // NEW background variants used per-slide by the Layout Architect
        "background_default": "linear-gradient(160deg, [backgroundStart], [backgroundEnd])",
        "background_title": "radial-gradient(circle at top, [primary] 10%, transparent 60%), linear-gradient(160deg, [backgroundStart], [backgroundEnd])",
        "background_subtle": "linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), linear-gradient(160deg, [backgroundStart], [backgroundEnd])"
      },
      "typography": {
        "headingFont": "string",
        "bodyFont": "string"
      },
      "styleTokens": {
        "glassBackgroundColor": "string (rgba format)",
        "glassBorderColor": "string (rgba format)",
        "glassBlur": "string (e.g., '12px')",
        "cardShadow": "string (e.g., '0 10px 30px rgba(0, 0, 0, 0.4)')",
        "borderRadius": "string (e.g., '16px')"
      }
    }
  `;

  return await callGoogleGemini({ system, user, json: true });
}

/**
 * [NEW & IMPROVED] Stages 2 & 3: The Content Strategist & Asset Producer
 * Analyzes a single slide's content to choose the best layout, elaborate on the text,
 * structure the data, and generate specific image prompts.
 */
export async function generateRecipeForSlide(slideBlueprint, topic, designSystem) {
  const system = `You are a world-class Information Designer. Your SOLE task is to convert a raw slide blueprint into a structured JSON recipe. You must follow all rules and output only the JSON.`;

  const user = `
    // You MUST adhere to this global Design System.
    "designSystem": ${JSON.stringify(designSystem || {})}

    // This is the blueprint for the single slide you must design.
    "slideBlueprint": ${JSON.stringify(slideBlueprint || {})}

    // These are the only layouts you are allowed to choose from.
    "availableLayouts": ["TitleSlide", "Agenda", "SectionHeader", "TwoColumn", "FeatureGrid", "ProcessDiagram", "DataChart", "Timeline", "ComparisonTable", "Quote"]

    **CRITICAL INSTRUCTIONS:**
    1.  **CHOOSE LAYOUT:** Select the BEST layout from 'availableLayouts' that matches the 'slideBlueprint.visual_element.type'. Be forgiving with the names (e.g., 'TitleLayout' -> 'TitleSlide', 'AgendaLayout' -> 'TwoColumn', 'ThreeColumnText' -> 'TwoColumn').
    2.  **STRUCTURE PROPS - THIS IS MANDATORY:**
        - Create a 'props' object for your chosen layout.
        - The 'props.title' MUST be the 'slideBlueprint.slide_title'.
        - You MUST process the 'slideBlueprint.content_points' and place them inside the props. For a 'TwoColumn' layout, create a 'props.bullets' array containing those points. For 'Quote', set 'props.quote' and optional 'props.author'. For 'DataChart', build a valid Chart.js config using the designSystem colors.
    3.  **SPECIAL HANDLING FOR 'Agenda':** If you choose 'Agenda', set props.title to 'Agenda' (or the blueprint title if more specific) and put all 'slideBlueprint.content_points' into 'props.items' as a string array. Do not include image prompts.
    4.  **CREATE IMAGE PROMPT:** If the layout is 'TwoColumn' or 'FeatureGrid', create a highly specific and artistic 'image_prompt' that is DIRECTLY related to the content of 'slideBlueprint.content_points'. Otherwise, set to null.
    5.  **CHOOSE BACKGROUND:** Select the most fitting background variant from 'designSystem.gradients'. 'TitleSlide' should use 'background_title'.

    **YOUR RESPONSE MUST BE A SINGLE VALID JSON OBJECT. EXAMPLE FOR A 'TwoColumn' SLIDE:**
    {
      "layout_type": "TwoColumn",
      "backgroundVariant": "background_default",
      "props": {
        "title": "Black in Luxury Branding",
        "bullets": [
          "Pairing black with metallic accents like gold or silver immediately conveys a sense of opulence.",
          "This strategy is a cornerstone for high-end fashion, jewelry, and luxury automotive brands.",
          "Iconic examples include the timeless branding of Chanel, Yves Saint Laurent, and Mercedes-Benz.",
          "Effective use of negative space is crucial to achieving a minimalist and luxurious feel."
        ]
      },
      "image_prompt": "An elegant, minimalist flat lay of a black Chanel perfume bottle on a dark marble surface with subtle gold dust accents, studio lighting."
    }
  `;

  return await callGoogleGemini({ system, user, json: true });
}

// Public: stream slide recipes one by one
// Note: Orchestration for streaming slide recipes now lives in the API route
// (src/app/api/ai/route.js) where slides are generated in parallel after the
// design system is created. This avoids confusion and keeps ai.js focused on
// single-call primitives.
