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
  4.  **Available Visual Elements:** ['TitleSlide', 'Agenda', 'TwoColumn', 'Quote', 'SectionHeader', 'FeatureGrid', 'ProcessDiagram', 'DataChart', 'Timeline', 'ComparisonTable', 'TeamMembers', 'KpiGrid'].

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
export async function generateDesignSystem(topic, angle, theme = 'Tech') {
  const system = `You are a visionary Creative Director at a top-tier design agency. Your specialty is creating stunning, professional brand identities for presentations based on a chosen theme. Your output must be only a single, valid JSON object.`;

  const themeDirectives = getThemeDirectives(theme);

  const user = `
    The presentation topic is: "${topic}".
    The chosen angle is: "${angle?.title || ''}".
    The chosen theme is: "${theme}".

    Generate a complete and cohesive Design System with a '${themeDirectives.aesthetic}' aesthetic.

    - Color Palette Instructions: ${themeDirectives.colorPalette}
    - Typography Instructions: ${themeDirectives.typography}
    - Style Token Instructions: ${themeDirectives.styleTokens}

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

// [NEW] Helper function for theme-specific AI instructions
function getThemeDirectives(theme = 'Tech') {
  switch (theme) {
    case 'Minimalist':
      return {
        aesthetic: "Clean, simple, and elegant, with a focus on typography and whitespace.",
        colorPalette: "Use a monochromatic color palette with a single accent color. The background should be a very light grey or off-white. Text should be dark grey, not pure black.",
        typography: "Choose one highly legible sans-serif font for both headings and body, like 'Inter' or 'Helvetica Neue'. Use font weight and size to create hierarchy.",
        styleTokens: "Minimalist design avoids heavy effects. Use flat colors. 'glassBackgroundColor' should be a nearly transparent white with a slight blur. Shadows should be subtle and soft."
      };
    case 'Corporate':
      return {
        aesthetic: "Professional, polished, and trustworthy, with a classic business-oriented color palette.",
        colorPalette: "Generate a palette based on blues, greys, and a contrasting accent color like gold or a muted green. The background should be a subtle gradient of dark blue or grey.",
        typography: "Choose a classic serif font for headings (e.g., 'Georgia', 'Merriweather') and a clean sans-serif for body text (e.g., 'Lato', 'Open Sans').",
        styleTokens: "Use clean lines and solid blocks of color. 'glassBackgroundColor' should be a semi-transparent dark color. Shadows should be crisp and professional. Use a slightly larger border radius for a modern corporate feel."
      };
    case 'Elegant':
      return {
        aesthetic: "Sophisticated, refined, and luxurious.",
        colorPalette: "Create a palette with deep, rich colors like burgundy, forest green, or royal purple, paired with cream, gold, or silver accents. The background should be a dark, moody gradient.",
        typography: "Use a stylish serif font for headings, possibly with high contrast (e.g., 'Playfair Display', 'Lora'), and a clean, light sans-serif for body text.",
        styleTokens: "Effects should be subtle and high-quality. 'glassBackgroundColor' could be a tinted, semi-transparent color. Shadows should be diffuse and soft. Use thin lines and delicate accents."
      };
    case 'Tech': // Default
    default:
      return {
        aesthetic: "Modern, innovative, and futuristic, with dark backgrounds and vibrant, energetic accent colors.",
        colorPalette: "Must be sophisticated. Include a dark gradient for the background, vibrant primary/secondary colors for focus (e.g., electric blue, magenta), and a bright accent for call-to-action elements.",
        typography: "Choose one bold, clean font for headings (like 'Exo 2', 'Space Grotesk', 'Montserrat') and one highly readable font for body text (like 'Inter', 'Lato', 'Roboto').",
        styleTokens: "Define properties for glassmorphism, shadows, and other visual effects. The 'glassBackgroundColor' MUST have transparency (e.g., 'rgba(255, 255, 255, 0.1)')."
      };
  }
}

/**
 * [NEW & IMPROVED] Stages 2 & 3: The Content Strategist & Asset Producer
 * Analyzes a single slide's content to choose the best layout, elaborate on the text,
 * structure the data, and generate specific image prompts.
 */
export async function generateRecipeForSlide(slideBlueprint, topic, designSystem) {
  const system = `You are a world-class Information Designer and Content Strategist. Your task is to convert a raw slide blueprint into a rich, detailed, and structured JSON recipe. You MUST follow all rules and output only the valid JSON.`;

  const user = `
    // This is the global Design System you must adhere to.
    "designSystem": ${JSON.stringify(designSystem || {})}

    // This is the blueprint for the SINGLE slide you must design.
    "slideBlueprint": ${JSON.stringify(slideBlueprint || {})}

    // These are the ONLY layouts you are allowed to choose from.
    "availableLayouts": [
      "TitleSlide", "Agenda", "SectionHeader", "TwoColumn", "FeatureGrid", 
      "ProcessDiagram", "DataChart", "Timeline", "ComparisonTable", "Quote", 
      "KpiGrid", "FullBleedImageLayout", "TitleAndBulletsLayout", "ContactInfoLayout", "TeamMembers"
    ]

    **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW ALL OF THESE:**

    1.  **CHOOSE THE BEST LAYOUT CREATIVELY:** Select the MOST appropriate layout from 'availableLayouts' that fits the blueprint's intent. Be creative. Don't overuse 'TitleAndBulletsLayout'. Use 'FullBleedImageLayout' for impactful openers or section breaks. Use 'ContactInfoLayout' for the final slide. Consider 'KpiGrid' for impressive numbers and 'Quote' for powerful statements.
    2.  **EXPAND THE CONTENT (MANDATORY):** Do not just copy the 'content_points'. You MUST elaborate on them to create compelling slide content.
        - Write an introductory 'body' paragraph (2-3 sentences) that sets the context for the slide where appropriate.
        - The original 'content_points' should be expanded and used as a 'bullets' or 'items' array. Make the points more engaging.
    3.  **GENERATE DIVERSE SPEAKER NOTES (MANDATORY):** For EVERY slide, you MUST write 2-4 sentences of insightful 'speaker_notes'. These should contain extra details, data, anecdotes, or talking points not visible on the slide to help the presenter.
    4.  **CREATE CONTEXTUAL DATA (IF APPLICABLE):** If you choose 'DataChart', 'KpiGrid', or 'ComparisonTable', you MUST generate realistic and contextually relevant data based on the slide's topic. DO NOT use generic placeholder data.
    5.  **SUGGEST CONTEXTUAL ICONS (IF APPLICABLE):** If the layout is 'FeatureGrid' or 'ProcessDiagram', for each item/feature, you MUST suggest a relevant icon name from the 'lucide-react' library (e.g., "TrendingUp", "ShieldCheck", "Users"). Add it as an 'icon' property to each feature object.
    6.  **CREATE ARTISTIC IMAGE PROMPTS:** If the slide requires an image ('TwoColumn', 'FullBleedImageLayout'), create a highly specific and artistic 'image_prompt'. Include style keywords (e.g., 'photorealistic, cinematic lighting', 'abstract 3D render, pastel colors'). Otherwise, set to null.
    7.  **USE LAYOUT OPTIONS DYNAMICALLY:** For the 'TwoColumn' layout, randomly choose to set an 'imagePosition' property to either 'left' or 'right' to create visual variety in the presentation.
    8.  **CHOOSE A BACKGROUND INTELLIGENTLY:** Select the most fitting background variant from 'designSystem.gradients'. Use 'background_title' for 'TitleSlide' and 'FullBleedImageLayout' to make them stand out. Use 'background_subtle' for text-heavy slides like 'TitleAndBulletsLayout' or 'Agenda' to ensure readability. Default to 'background_default' for others.

    **YOUR RESPONSE MUST BE A SINGLE, VALID JSON OBJECT. NO MARKDOWN, NO COMMENTARY.**
    
    **EXAMPLE FOR A 'FeatureGrid' SLIDE:**
    {
      "layout_type": "FeatureGrid",
      "backgroundVariant": "background_default",
      "props": {
        "title": "Our Core Features",
        "body": "Our platform is built on three pillars that ensure reliability, scalability, and security for all our users. Here's how each component contributes to a seamless experience.",
        "features": [
          { "icon": "TrendingUp", "title": "Scalable Infrastructure", "description": "Our architecture handles millions of requests, scaling automatically with user demand." },
          { "icon": "ShieldCheck", "title": "Enterprise-Grade Security", "description": "We protect your data with end-to-end encryption and regular security audits." },
          { "icon": "Users", "title": "Collaborative Workspace", "description": "Work together with your team in a shared, real-time environment." }
        ]
      },
      "image_prompt": null,
      "speaker_notes": "Mention that our uptime last quarter was 99.99%. Also, highlight that our security protocols are compliant with ISO 27001 standards."
    }
  `;

  return await callGoogleGemini({ system, user, json: true });
}

// Public: stream slide recipes one by one
// Note: Orchestration for streaming slide recipes now lives in the API route
// (src/app/api/ai/route.js) where slides are generated in parallel after the
// design system is created. This avoids confusion and keeps ai.js focused on
// single-call primitives.
