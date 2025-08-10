 const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
 const DEFAULT_MODEL = 'gemini-2.0-flash';

 async function callGoogleGemini({ system, user, json = true }) {
   if (!GOOGLE_GEMINI_API_KEY) {
     // No key: return null so the caller can trigger fallbacks
     return null;
   }

   // Build request body following Gemini REST API schema
   const body = {
     contents: user ? [{ role: 'user', parts: [{ text: user }] }] : [],
     generationConfig: {
       response_mime_type: json ? 'application/json' : 'text/plain',
     },
   };

   if (system) {
     // Use system_instruction rather than a 'system' role message
     body.system_instruction = { parts: [{ text: system }] };
   }

   const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'x-goog-api-key': GOOGLE_GEMINI_API_KEY,
     },
     body: JSON.stringify(body),
   });

   if (!res.ok) {
     let errMsg = 'Unknown Google Gemini API error';
     try {
       const error = await res.json();
       errMsg = error?.error?.message || JSON.stringify(error);
     } catch (_) {}
     throw new Error(`Google Gemini API error: ${errMsg}`);
   }

   const data = await res.json();
   const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
   if (!content) throw new Error('Empty Google Gemini API response');

   try {
     return json ? JSON.parse(content) : content;
   } catch {
     // If model returned non-JSON while json=true, signal fallback
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
      You are a Creative Director and Brand Designer.
      Goal: Create a high-quality presentation blueprint that includes a Generative Design System (GDS) and rich, varied content blocks suitable for rendering in a 12-column grid.
      Requirements:
      - Produce a cohesive GDS with: extended palette (text_primary, text_secondary, background_primary, background_secondary, accent_primary, accent_secondary, data_positive, data_negative, neutral), typography pairing (heading_font, body_font, heading_scale, body_scale, line_height), mood_keywords, and optional iconography/shapes_motif. Ensure high contrast for dark backgrounds and readability.
      - For each slide: include a strong title, and 3–5 content points OR 1–3 rich content blocks (prefer blocks), plus a visual_suggestion and optional speaker_notes.
      - Use a variety of Rich Content Blocks: bullet_points, paragraph, statistic_highlight, pull_quote, callout, image_request, diagram_request, table_request. Choose blocks that enhance narrative and visual interest.
      - Keep slides concise (1–3 blocks). Blocks may coexist with content_points; renderer prioritizes blocks.
      - Be concrete, accurate, audience-appropriate. Avoid vagueness and filler.
      - Take your time to craft each element properly.
      Output strictly valid JSON only.`;

    const user = `
      Generate a ${count}-slide presentation blueprint for the topic: "${topic}".
      The chosen angle for this presentation is: ${JSON.stringify({ angle_id: angle.angle_id, title: angle.title, description: angle.description, audience: angle.audience })}.

      Your response must be a JSON object that follows this exact structure, filling in all values with high-quality, relevant content. Do not use placeholder text. Respect the exact field names and constraints.
      {
        "topic": "The topic of the presentation",
        "chosen_angle": { "angle_id": "...", "title": "...", "description": "...", "audience": "Technical|General|Executive|Academic|Students" },
        "slide_count": ${count},
        "theme": {
          "name": "A creative and relevant theme name",
          "description": "A detailed paragraph describing the theme's focus, tone, and visual direction.",
          "palette": {
            "text_primary": "#ffffff",
            "text_secondary": "#cccccc",
            "background_primary": "#0b0b0b",
            "background_secondary": "#111111",
            "accent_primary": "#ffe1c6",
            "accent_secondary": "#ffd199",
            "data_positive": "#5cc98a",
            "data_negative": "#ff6b6b",
            "neutral": "#888888"
          },
          "typography": {
            "heading_font": "Inter",
            "body_font": "Lora",
            "heading_scale": 1.3,
            "body_scale": 1.0,
            "line_height": 1.4
          },
          "mood_keywords": ["minimalist","bold","high-contrast"],
          "iconography": "thin-outline",
          "shapes_motif": "rounded-cards"
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
            "blocks": [
              { "bullet_points": { "items": ["Point A","Point B","Point C"] } },
              { "image_request": { "keywords": ["topic","abstract"], "usage": "background", "alt_hint": "atmospheric" } }
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
    if (!out || !Array.isArray(out.slides)) {
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
        theme: {
          name: 'Nether Default',
          description: 'Dark background with pearl accent; readable white text and subtle grays for secondary elements.',
          palette: { background: '#000000', primary: '#ffffff', secondary: '#cccccc', accent: '#ffe1c6' },
        },
        slides,
      };
    }

    // Sanitize and normalize
    const safeStr = (v, max) => String(v || '').slice(0, max);
    // Build extended GDS
    const pal = out?.theme?.palette || {};
    const typ = out?.theme?.typography || {};
    const clampNum = (n, lo, hi, d) => {
      const v = Number(n);
      return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d;
    };
    const theme = {
      name: safeStr(out?.theme?.name || 'Nether Theme', 60),
      description: safeStr(out?.theme?.description || 'Cohesive dark theme with pearl accent.', 320),
      palette: {
        text_primary: pal.text_primary || pal.primary || '#ffffff',
        text_secondary: pal.text_secondary || '#cccccc',
        background_primary: pal.background_primary || pal.background || '#000000',
        background_secondary: pal.background_secondary || '#111111',
        accent_primary: pal.accent_primary || pal.accent || '#ffe1c6',
        accent_secondary: pal.accent_secondary || '#ffd199',
        data_positive: pal.data_positive || '#5cc98a',
        data_negative: pal.data_negative || '#ff6b6b',
        neutral: pal.neutral || '#888888',
      },
      typography: {
        heading_font: safeStr(typ.heading_font || 'Inter', 40),
        body_font: safeStr(typ.body_font || 'Lora', 40),
        heading_scale: clampNum(typ.heading_scale, 1.0, 1.6, 1.3),
        body_scale: clampNum(typ.body_scale, 0.9, 1.1, 1.0),
        line_height: clampNum(typ.line_height, 1.2, 1.6, 1.4),
      },
      mood_keywords: Array.isArray(out?.theme?.mood_keywords) ? out.theme.mood_keywords.slice(0, 8).map((s) => safeStr(s, 24)) : ['minimalist','bold','high-contrast'],
      iconography: out?.theme?.iconography ? safeStr(out.theme.iconography, 40) : undefined,
      shapes_motif: out?.theme?.shapes_motif ? safeStr(out.theme.shapes_motif, 40) : undefined,
    };

    // Ensure slides length matches count; clamp and fix fields
    const slidesIn = out.slides.slice(0, count);
    while (slidesIn.length < count) {
      const i = slidesIn.length;
      slidesIn.push({
        slide_id: `s-${String(i + 1).padStart(2, '0')}`,
        slide_index: i + 1,
        slide_title: i === 0 ? 'Introduction' : i === count - 1 ? 'Conclusion' : `Key Idea ${i}`,
        content_points: ['Main point', 'Supporting detail', 'Example'],
        visual_suggestion: { description: 'Subtle background visual related to the topic.' },
      });
    }

    const normalizeBlocks = (blocks) => {
      if (!Array.isArray(blocks)) return undefined;
      const out = [];
      for (const b of blocks.slice(0, 3)) {
        if (b?.bullet_points?.items && Array.isArray(b.bullet_points.items)) {
          out.push({ bullet_points: { items: b.bullet_points.items.slice(0, 6).map((x) => safeStr(x, 180)) } });
        } else if (b?.paragraph?.text) {
          out.push({ paragraph: { text: safeStr(b.paragraph.text, 600) } });
        } else if (b?.statistic_highlight?.value) {
          out.push({ statistic_highlight: { value: safeStr(b.statistic_highlight.value, 60), description: safeStr(b.statistic_highlight.description || '', 180) } });
        } else if (b?.pull_quote?.text) {
          out.push({ pull_quote: { text: safeStr(b.pull_quote.text, 240), author: b.pull_quote.author ? safeStr(b.pull_quote.author, 80) : undefined } });
        } else if (b?.callout?.title) {
          out.push({ callout: { title: safeStr(b.callout.title, 80), text: safeStr(b.callout.text || '', 240) } });
        } else if (b?.image_request?.keywords) {
          const usage = ['background','inline'].includes(b.image_request.usage) ? b.image_request.usage : 'inline';
          out.push({ image_request: { keywords: (b.image_request.keywords || []).slice(0, 8).map((k) => safeStr(k, 32)), usage, alt_hint: b.image_request.alt_hint ? safeStr(b.image_request.alt_hint, 80) : undefined } });
        } else if (b?.diagram_request?.kind) {
          const kind = ['flowchart','timeline','org','mindmap'].includes(b.diagram_request.kind) ? b.diagram_request.kind : 'flowchart';
          out.push({ diagram_request: { kind, hint: b.diagram_request.hint ? safeStr(b.diagram_request.hint, 120) : undefined } });
        } else if (b?.table_request?.columns) {
          out.push({ table_request: { columns: (b.table_request.columns || []).slice(0, 6).map((c) => safeStr(c, 24)), rows_hint: b.table_request.rows_hint ? safeStr(b.table_request.rows_hint, 160) : '' } });
        }
      }
      return out.length ? out : undefined;
    };

    const slides = slidesIn.map((s, i) => ({
      slide_id: s.slide_id || `s-${String(i + 1).padStart(2, '0')}`,
      slide_index: i + 1,
      slide_title: safeStr(s.slide_title || `Slide ${i + 1}`, 90),
      content_points: Array.isArray(s.content_points) && s.content_points.length
        ? s.content_points.slice(0, 5).map((p) => safeStr(p, 180))
        : ['Main point', 'Supporting detail', 'Example'],
      blocks: normalizeBlocks(s.blocks),
      speaker_notes: s.speaker_notes ? safeStr(s.speaker_notes, 600) : undefined,
      visual_suggestion: s.visual_suggestion?.description
        ? { ...s.visual_suggestion, description: safeStr(s.visual_suggestion.description, 180) }
        : (s.visual_suggestion ? s.visual_suggestion : { description: 'Neutral background visual.' }),
      attachments: Array.isArray(s.attachments) ? s.attachments.slice(0, 8) : undefined,
    }));

    return {
      topic: safeStr(out.topic || topic, 200),
      chosen_angle: out.chosen_angle || angle,
      slide_count: count,
      theme,
      slides,
    };
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
    'You are a Senior Layout Composer and Frontend Developer. Take your time to produce high-quality slides.',
    'Return strictly JSON: { theme_runtime, recipes: Recipe[] }. No extra commentary.',
    'theme_runtime derives from GDS: { background, primary, secondary, accent } mapped from theme.palette/background/text/accent.',
    'For each slide (each Recipe) you can choose one of two modes:',
    '1) Element Grid Mode (backward compatible): provide elements[] with 12-column grid coordinates.',
    '   Element spec: { type: Title|BulletedList|Paragraph|Image|Diagram|Table|Quote|Stat|Callout, content, style_hints, grid: { colStart, colEnd, rowStart, rowEnd }, background_element?, accessibility? }. Maintain readability, consistent scale, and respect theme GDS typography and palette. Composition rules: long titles span 8–12 cols near top rows; lists align left with ample whitespace; diagrams/tables get generous area; images as background require readable overlays; avoid edges; maintain safe margins.',
    '2) Code Mode (preferred for maximum fidelity): provide code: { html, css, js } representing a self-contained slide implementation.',
    '   - All CSS and JS must be inline via <style> and <script> tags or provided in css/js strings; no external libs.',
    '   - Use the provided GDS palette/typography within CSS (colors, fonts, scale).',
    '   - Use modern CSS Grid/Flexbox for layout; ensure the design fills a 16:9 viewport responsively.',
    'Accessibility: provide aria_label for key elements; images include alt text when possible.',
  ].join('\n');

  const user = JSON.stringify({ blueprint, instructions: {
    grid: 'Use 12-column grid, include {colStart,colEnd,rowStart,rowEnd} for every element. Respect safe margins and avoid edge collisions.',
    theme: 'Derive colors from blueprint.theme.palette; ensure high contrast for dark background with white text. Use GDS typography scale for sizing.',
    accessibility: 'Provide aria_label for titles, quotes, stats; include alt in accessibility for images when possible.',
    backgrounds: 'For title/section slides, you may add a subtle animated generative background using theme accents.',
  }});
  let out = null;
  try {
    out = await callGoogleGemini({ system, user, json: true });
  } catch (_) {}

  // Validate minimal contract (Section 17.4)
  const mkDefault = () => {
    const pal = blueprint?.theme?.palette || {};
    const theme_runtime = {
      background: pal.background_primary || pal.background || '#000000',
      primary: pal.text_primary || pal.primary || '#ffffff',
      secondary: pal.text_secondary || pal.secondary || '#cccccc',
      accent: pal.accent_primary || pal.accent || '#ffe1c6',
    };

    const gridPresets = {
      TitleOnly: [
        { type: 'Title', grid: { colStart: 2, colEnd: 12, rowStart: 1, rowEnd: 3 }, style_hints: { size: 'xl', align: 'center', accent: true } },
      ],
      Quote: [
        { type: 'Title', grid: { colStart: 2, colEnd: 10, rowStart: 1, rowEnd: 2 }, style_hints: { size: 'lg', accent: true } },
        { type: 'Quote', grid: { colStart: 2, colEnd: 11, rowStart: 2, rowEnd: 5 }, style_hints: { size: 'md' } },
      ],
      TitleAndBullets: [
        { type: 'Title', grid: { colStart: 2, colEnd: 9, rowStart: 1, rowEnd: 2 }, style_hints: { size: 'lg', accent: true } },
        { type: 'BulletedList', grid: { colStart: 2, colEnd: 9, rowStart: 2, rowEnd: 6 }, style_hints: { size: 'md' } },
      ],
    };

    const recipes = blueprint.slides.map((s, idx) => {
      const isTitle = idx === 0;
      const isSection = idx > 0 && (idx % 5 === 0);
      const layout_type = isTitle ? 'TitleOnly' : isSection ? 'Quote' : 'TitleAndBullets';
      const background = { color: theme_runtime.background, overlay: false };
      const preset = gridPresets[layout_type];
      const elements = preset.map((el) => ({
        ...el,
        content: el.type === 'Title' ? s.slide_title : (el.type === 'BulletedList' ? (s.blocks?.find(b=>b.bullet_points)?.bullet_points?.items || s.content_points) : (s.speaker_notes || '')),
      }));
      const backgroundExtras = (isTitle || isSection) ? { generative_background: { library: 'gradient-js', options: { colors: [theme_runtime.background, theme_runtime.accent] } } } : {};
      return { slide_id: s.slide_id, layout_type, background: { ...background, ...backgroundExtras }, elements };
    });

    return { theme_runtime, recipes };
  };

  if (!out || !Array.isArray(out.recipes) || out.recipes.length !== blueprint.slides.length) {
    return mkDefault();
  }

  // Light sanitation with grid support and new element types
  const theme_runtime = out.theme_runtime || (() => {
    const pal = blueprint?.theme?.palette || {};
    return {
      background: pal.background_primary || pal.background || '#000000',
      primary: pal.text_primary || pal.primary || '#ffffff',
      secondary: pal.text_secondary || pal.secondary || '#cccccc',
      accent: pal.accent_primary || pal.accent || '#ffe1c6',
    };
  })();

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const within = (n, lo, hi) => n >= lo && n <= hi;
  const fixGrid = (g) => {
    const cg = {
      colStart: clamp(parseInt(g?.colStart || 1, 10), 1, 12),
      colEnd: clamp(parseInt(g?.colEnd || 7, 10), 2, 13),
      rowStart: clamp(parseInt(g?.rowStart || 1, 10), 1, 100),
      rowEnd: clamp(parseInt(g?.rowEnd || 3, 10), 2, 200),
    };
    if (cg.colEnd <= cg.colStart) cg.colEnd = Math.min(13, cg.colStart + 1);
    if (cg.rowEnd <= cg.rowStart) cg.rowEnd = cg.rowStart + 1;
    return cg;
  };

  const recipes = out.recipes.map((r, i) => {
    const fallbackLayout = 'TitleAndBullets';
    const slide = blueprint.slides[i];
    const cleaned = {
      slide_id: r.slide_id || slide.slide_id,
      layout_type: r.layout_type || fallbackLayout,
      background: r.background || { color: theme_runtime.background },
      // Preserve element grid mode when provided
      elements: Array.isArray(r.elements) ? r.elements.slice(0, 8).map((e, idx) => ({
        type: e.type || (idx === 0 ? 'Title' : 'Paragraph'),
        content: e.content ?? (idx === 0 ? slide.slide_title : (slide.blocks?.find(b=>b.paragraph)?.paragraph?.text || slide.content_points || '')),
        style_hints: e.style_hints || { size: idx === 0 ? 'lg' : 'md' },
        grid: fixGrid(e.grid),
        background_element: !!e.background_element,
        accessibility: e.accessibility,
      })) : [],
      // Preserve code mode when provided
      code: (r.code && (typeof r.code === 'object')) ? {
        html: typeof r.code.html === 'string' ? r.code.html : undefined,
        css: typeof r.code.css === 'string' ? r.code.css : undefined,
        js: typeof r.code.js === 'string' ? r.code.js : undefined,
      } : undefined,
    };
    // basic overlap avoidance: bump rowStart for later elements if overlapping
    for (let a = 0; a < cleaned.elements.length; a++) {
      for (let b = a + 1; b < cleaned.elements.length; b++) {
        const A = cleaned.elements[a].grid, B = cleaned.elements[b].grid;
        const colOverlap = !(B.colStart >= A.colEnd || B.colEnd <= A.colStart);
        const rowOverlap = !(B.rowStart >= A.rowEnd || B.rowEnd <= A.rowStart);
        if (colOverlap && rowOverlap) {
          const delta = (A.rowEnd - A.rowStart) + 1;
          cleaned.elements[b].grid.rowStart = A.rowEnd + 1;
          cleaned.elements[b].grid.rowEnd = cleaned.elements[b].grid.rowStart + delta;
        }
      }
    }
    return cleaned;
  });

  return { theme_runtime, recipes };
}