// src/core/ai.js
// Direct Google Gemini AI logic.

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const DEFAULT_MODEL = 'gemini-2.0-flash';

async function callGoogleGemini({ system, user, json = true }) {
  if (!GOOGLE_GEMINI_API_KEY) {
    // No key: return null so the caller can trigger fallbacks
    return null;
  }

  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  if (user) messages.push({ role: 'user', content: user });

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GOOGLE_GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: messages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })),
      generationConfig: {
        response_mime_type: json ? 'application/json' : 'text/plain',
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Google Gemini API error: ${error.error.message}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Empty Google Gemini API response');

  try {
    return json ? JSON.parse(content) : content;
  } catch {
    return null;
  }
}

// 6.2 generate_angles
export async function generateStrategicAngles(topic) {
  try {
    if (!topic || typeof topic !== 'string') throw new Error('Topic required');

    const system = `
      You are a world-class presentation strategist and creative director.
      Your task is to generate 3 distinct, insightful, and strategic angles for a presentation based on a given topic.
      Each angle must have a unique ID, a compelling title, a concise description, a target audience, and a few keywords.
      Your output must be a single, valid JSON object and nothing else.
    `;

    const user = `
      Generate 3 strategic angles for the presentation topic: "${topic}".

      Your response must be a JSON object that follows this exact structure:
      {
        "angles": [
          {
            "angle_id": "unique_id_1",
            "title": "A Creative and Engaging Title for Angle 1",
            "description": "A brief, insightful description of the first strategic angle.",
            "audience": "A specific target audience (e.g., Technical, Executive, General)",
            "emphasis_keywords": ["keyword1", "keyword2", "keyword3"]
          },
          {
            "angle_id": "unique_id_2",
            "title": "A Different and Compelling Title for Angle 2",
            "description": "A brief, insightful description of the second strategic angle.",
            "audience": "A specific target audience",
            "emphasis_keywords": ["keyword4", "keyword5", "keyword6"]
          },
          {
            "angle_id": "unique_id_3",
            "title": "A Third, Contrasting Title for Angle 3",
            "description": "A brief, insightful description of the third strategic angle.",
            "audience": "A specific target audience",
            "emphasis_keywords": ["keyword7", "keyword8", "keyword9"]
          }
        ]
      }
    `;
    const out = await callGoogleGemini({ system, user, json: true });

    // Phase 4.1: Enhanced fallback strategies
    const valid = Array.isArray(out?.angles) && out.angles.length >= 2;
    if (!valid) {
      // Provide topic-aware fallback angles when AI fails
      const topicLower = topic.toLowerCase();
      const fallbackAngles = [];
      
      if (topicLower.includes('tech') || topicLower.includes('software') || topicLower.includes('system')) {
        fallbackAngles.push({ angle_id: 'technical', title: 'Technical Deep-Dive', description: 'Explain the mechanisms and architecture.', audience: 'Technical', emphasis_keywords: ['architecture','performance','scalability'] });
        fallbackAngles.push({ angle_id: 'business', title: 'Business Impact', description: 'Focus on ROI and business value.', audience: 'Executive', emphasis_keywords: ['roi','efficiency','growth'] });
      } else if (topicLower.includes('health') || topicLower.includes('medical') || topicLower.includes('wellness')) {
        fallbackAngles.push({ angle_id: 'scientific', title: 'Evidence-Based Approach', description: 'Present research and data.', audience: 'Academic', emphasis_keywords: ['research','evidence','outcomes'] });
        fallbackAngles.push({ angle_id: 'human', title: 'Patient-Centered Story', description: 'Focus on human impact and care.', audience: 'General', emphasis_keywords: ['care','wellbeing','hope'] });
      } else {
        // Generic fallbacks
        fallbackAngles.push({ angle_id: 'inspirational', title: 'Vision and Impact', description: 'Tell a story that inspires action.', audience: 'General', emphasis_keywords: ['story','impact','future'] });
        fallbackAngles.push({ angle_id: 'practical', title: 'Practical Application', description: 'Focus on actionable insights.', audience: 'General', emphasis_keywords: ['practical','actionable','steps'] });
        fallbackAngles.push({ angle_id: 'analytical', title: 'Data-Driven Analysis', description: 'Present facts and analytical insights.', audience: 'Executive', emphasis_keywords: ['data','analysis','insights'] });
      }
      
      return { angles: fallbackAngles };
    }

    // Truncate and sanitize per Section 17.1
    const angles = out.angles.slice(0, 3).map((a, idx, arr) => ({
      angle_id: String(a.angle_id || `angle-${idx}`).slice(0, 40),
      title: String(a.title || `Angle ${idx + 1}`).slice(0, 80),
      description: String(a.description || '').slice(0, 280),
      audience: ['Technical','General','Executive','Academic','Students'].includes(a.audience) ? a.audience : 'General',
      emphasis_keywords: Array.isArray(a.emphasis_keywords) ? a.emphasis_keywords.slice(0, 7).map(String) : [],
    }));

    // Ensure uniqueness of angle_id
    const seen = new Set();
    const unique = angles.map((a) => {
      let id = a.angle_id;
      let i = 1;
      while (seen.has(id)) id = `${a.angle_id}-${i++}`;
      seen.add(id);
      return { ...a, angle_id: id };
    });
    
    return { angles: unique };
  } catch (e) {
    // Fallback per Section 10.2
    return {
      angles: [
        { angle_id: 'technical', title: 'Technical Deep-Dive', description: 'Explain the mechanisms and architecture.', audience: 'Technical' },
        { angle_id: 'inspirational', title: 'Vision and Impact', description: 'Tell a story that inspires action.', audience: 'General' },
      ],
    };
  }
}

// 6.2 generate_blueprint
export async function generateBlueprint(topic, angle, slideCount = 10) {
    if (!topic || !angle) throw new Error('topic and angle required');
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 10));
    const count = clamp(slideCount, 3, 15);

    const system = `
      You are an expert presentation creator and content strategist. Your task is to generate a comprehensive and impressive blueprint for a presentation.
      This blueprint must be highly detailed, creative, and structured, providing a complete narrative arc.
      For each slide, you must provide a meaningful title, 3-5 detailed content points, specific and actionable visual suggestions (including ideas for diagrams, charts, or powerful imagery), and insightful speaker notes.
      You must also create a cohesive theme for the presentation, including a name, a descriptive paragraph, and a specific color palette.
      Your output must be a single, valid JSON object and nothing else.
    `;

    const user = `
      Generate a ${count}-slide presentation blueprint for the topic: "${topic}".
      The chosen angle for this presentation is: "${angle.title}".

      Your response must be a JSON object that follows this exact structure, filling in all values with high-quality, relevant content. Do not use placeholder text.
      {
        "topic": "The topic of the presentation",
        "theme": {
          "name": "A creative and relevant theme name",
          "description": "A detailed paragraph describing the theme's focus, tone, and visual direction.",
          "palette": {
            "primary_color": "A hex code for the main color",
            "accent_color_1": "A hex code for a vibrant accent color",
            "accent_color_2": "A hex code for a secondary accent or background color",
            "text_color": "A hex code for the main text color"
          }
        },
        "slides": [
          {
            "slide_id": "s-01",
            "slide_index": 1,
            "slide_title": "An engaging and relevant title for the first slide",
            "content_points": [
              "A detailed, topic-specific point.",
              "Another detailed, topic-specific point.",
              "A final detailed, topic-specific point."
            ],
            "visual_suggestion": {
              "description": "A specific and descriptive suggestion for a visual element for this slide."
            },
            "speaker_notes": "Detailed speaker notes for this slide, including what to emphasize and how to engage the audience."
          }
        ]
      }
    `;

    let out = null;
    try {
      out = await callGoogleGemini({ system, user, json: true });
    } catch (_) {}

    // Validate minimal contract per Section 17.2
    if (!out || !Array.isArray(out.slides) || out.slides.length !== count) {
      // Deterministic fallback outline
      const slides = Array.from({ length: count }).map((_, i) => ({
        slide_id: `s-${String(i + 1).padStart(2, '0')}`,
        slide_index: i + 1,
        slide_title: i === 0 ? 'Introduction' : i === count - 1 ? 'Conclusion' : `Key Idea ${i}`,
        content_points: i === 0
          ? ['Set the stage', 'Define the goal']
          : i === count - 1
            ? ['Summarize key takeaways', 'Call to action']
            : ['Main point', 'Supporting detail', 'Example'],
        visual_suggestion: { type: 'image', description: 'Subtle background visual related to the topic.' },
      }));
      return {
        topic,
        chosen_angle: angle,
        slide_count: count,
        slides,
      };
    }

    return out;
}


// 6.2 refine_blueprint
export async function refineBlueprintViaChat(blueprint, chatHistory = [], context = {}) {
  if (!blueprint || !Array.isArray(blueprint.slides)) throw new Error('Valid blueprint required');

  const system = [
    'You are a helpful presentation editor who respects explicit user edits.',
    'Return the FULL updated blueprint JSON only (no commentary).',
    'Do NOT reorder slides unless explicitly asked; preserve slide_id stability.',
    'If ambiguous, ask exactly one clarifying question in a field "_clarify" and do NOT make destructive changes.',
    // Part 4
    'When transforming content, prefer using blocks (bullet_points, paragraph, statistic_highlight, pull_quote, callout, image_request, diagram_request, table_request). Keep slide_id stable. Preserve theme GDS if present.'
  ].join('\n');

  const user = JSON.stringify({ blueprint, chatHistory: chatHistory?.slice(-20), context });
  let out = null;
  try {
    out = await callGoogleGemini({ system, user, json: true });
  } catch (_) {}

  // If invalid, fallback to no-op blueprint
  if (!out || !Array.isArray(out.slides)) {
    return blueprint;
  }
  // Ensure slide_ids preserved; if not, map by index
  const byIndex = (bp) => Object.fromEntries((bp.slides || []).map((s, i) => [i, s.slide_id]));
  const ids = byIndex(blueprint);
  const slides = out.slides.map((s, i) => ({
    ...s,
    slide_id: s.slide_id || ids[i] || `s-${String(i + 1).padStart(2, '0')}`,
    slide_index: Number(s.slide_index || i + 1),
  }));
  return { ...blueprint, ...out, slides };
}

// Phase 2.3: Streaming blueprint generation for improved UX
export async function generateBlueprintStreaming(topic, angle, slideCount = 10) {
  if (!topic || !angle) throw new Error('topic and angle required');
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 10));
  const count = clamp(slideCount, 3, 15);

  // Create a streaming response that generates slides one by one
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // First, send initial metadata
        const metadata = {
          type: 'metadata',
          topic,
          chosen_angle: angle,
          slide_count: count,
          theme: {
            name: 'Default Theme',
            palette: {
              text_primary: '#ffffff',
              background_primary: '#000000',
              accent_primary: '#ffe1c6'
            }
          }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

        // Generate slides progressively
        for (let i = 0; i < count; i++) {
          const slide = {
            type: 'slide',
            slide_id: `s-${String(i + 1).padStart(2, '0')}`,
            slide_index: i + 1,
            slide_title: i === 0 ? 'Introduction' : i === count - 1 ? 'Conclusion' : `Key Idea ${i}`,
            content_points: i === 0
              ? ['Set the stage', 'Define the goal']
              : i === count - 1
                ? ['Summarize key takeaways', 'Call to action']
                : ['Main point', 'Supporting detail', 'Example'],
            visual_suggestion: { type: 'image', description: 'Subtle background visual related to the topic.' },
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(slide)}\n\n`));

          // Add a small delay to simulate AI generation
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Send completion signal
        const completion = { type: 'complete' };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(completion)}\n\n`));

      } catch (error) {
        const errorData = { type: 'error', error: error.message };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return stream;
}

// 6.2 generate_recipes
export async function generateSlideRecipes(blueprint) {
  if (!blueprint || !Array.isArray(blueprint.slides)) throw new Error('Valid blueprint required');

  const system = [
    'You are a creative director choosing from a defined component library and layout patterns.',
    'Return JSON with { theme_runtime, recipes: [...] }. Ensure readability, consistent title sizes, and high contrast between text and background as defined by the generated theme. Use the theme\'s accent colors sparingly.',
    'For added visual appeal on title or section break slides, you may include background.generative_background with a library name and options. Colors used must come from the presentation\'s GDS palette.',
    // Part 4: Grid composer
    'Compose layouts on a 12-column grid. For each element, include optional grid: { colStart, colEnd, rowStart, rowEnd }. Avoid overlap unless layered by order.'
  ].join('\n');

  const user = JSON.stringify({ blueprint });
  let out = null;
  try {
    out = await callGoogleGemini({ system, user, json: true });
  } catch (_) {}

  // Validate minimal contract (Section 17.4)
  const mkDefault = () => ({
    theme_runtime: {
      background: '#000000', primary: '#ffffff', secondary: '#cccccc', accent: '#ffe1c6',
    },
    recipes: blueprint.slides.map((s) => ({
      slide_id: s.slide_id,
      layout_type: 'TitleAndBullets',
      background: { color: '#000000', overlay: false },
      elements: [
        { type: 'Title', content: s.slide_title, style_hints: { size: 'xl', accent: true } },
        { type: 'BulletedList', content: s.content_points, style_hints: { size: 'md' } },
      ],
    })),
  });

  if (!out || !Array.isArray(out.recipes) || out.recipes.length !== blueprint.slides.length) {
    return mkDefault();
  }

  // Light sanitation with grid support and new element types
  const theme_runtime = out.theme_runtime || { background: '#000', primary: '#fff', secondary: '#ccc', accent: '#ffe1c6' };
  const recipes = out.recipes.map((r, i) => ({
    slide_id: r.slide_id || blueprint.slides[i].slide_id,
    layout_type: r.layout_type || 'TitleAndBullets',
    background: r.background || { color: theme_runtime.background },
    elements: Array.isArray(r.elements) && r.elements.length > 0 ? r.elements.map((el) => ({
      type: el.type,
      content: el.content,
      style_hints: el.style_hints || {},
      position_hints: el.position_hints || {},
      grid: el.grid || undefined,
      diagram: el.diagram || undefined,
      table: el.table || undefined,
    })) : [
      { type: 'Title', content: blueprint.slides[i].slide_title },
      { type: 'BulletedList', content: blueprint.slides[i].content_points },
    ],
  }));

  return { theme_runtime, recipes };
}