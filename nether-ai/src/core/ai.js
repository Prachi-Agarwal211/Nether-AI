// src/core/ai.js
import { AI_CONFIG, getHeaders } from './ai-config';
import { generateImagePublicUrl } from './image-generation';
import toast from 'react-hot-toast';
export { generateImagePublicUrl };

// Universal helper to call the Gemini API with retry and error handling
async function callGoogleGemini({ system, user, json = true }, retries = 3) {
  const url = `${AI_CONFIG.endpointBase}/models/${AI_CONFIG.model}:generateContent`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    system_instruction: { parts: [{ text: system }] },
    generationConfig: { response_mime_type: json ? 'application/json' : 'text/plain' },
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(AI_CONFIG.timeoutMs),
      });

      if (!response.ok) {
        let errorText = '';
        try { errorText = await response.text(); } catch {}
        const errorMsg = `Google Gemini API error: ${response.status} ${response.statusText} ${errorText}`;
        if (attempt === retries) {
          toast.error(`AI request failed after ${retries} attempts: ${errorMsg}`);
          throw new Error(errorMsg);
        }
        toast(`AI request failed (attempt ${attempt}/${retries}), retrying...`, { icon: '🔄' });
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        const errorMsg = 'Empty response from AI';
        if (attempt === retries) {
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }
        continue;
      }

      if (attempt > 1) {
        toast.success('AI request succeeded after retry');
      }

      return json ? JSON.parse(rawText) : rawText;
    } catch (error) {
      if (attempt === retries) {
        toast.error(`AI request failed: ${error.message}`);
        throw error;
      }
      toast(`AI request error (attempt ${attempt}/${retries}), retrying...`, { icon: '🔄' });
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// [NEW] Logic for conversational interaction
export async function haveConversation(chatHistory) {
  const system = `You are Nether AI, an expert presentation strategist. Your goal is to help users craft the perfect presentation by having a natural conversation.

  **Your process is as follows:**
  1.  **Engage and Clarify:** Start by understanding the user's needs. Ask clarifying questions about their topic, audience, goals, and desired tone. Be friendly, concise, and helpful.
  2.  **Analyze:** Analyze the user's responses from the chat history.
  3.  **Decide When to Generate:** Once you have a clear understanding of the topic AND the intended audience, you can proceed to generate strategic angles. Do NOT generate angles prematurely if you lack key information.
  4.  **Generate Angles:** When ready, generate 4 diverse, compelling strategic angles for the presentation.
  
  **Output Format Rules:**
  - Your entire response MUST be a single, valid JSON object.
  - If you are asking a question or making a statement to continue the conversation, use this format:
    {
      "response_type": "text",
      "content": "Your text response here."
    }
  - If you have gathered enough information and are ready to provide the strategic angles, use this format:
    {
      "response_type": "angles",
      "content": {
        "angles": [
          { "angle_id": "angle_1", "title": "Angle Title 1", "key_points": ["Point A", "Point B", "Point C"] },
          { "angle_id": "angle_2", "title": "Angle Title 2", "key_points": ["Point D", "Point E", "Point F"] },
          { "angle_id": "angle_3", "title": "Angle Title 3", "key_points": ["Point G", "Point H", "Point I"] },
          { "angle_id": "angle_4", "title": "Angle Title 4", "key_points": ["Point J", "Point K", "Point L"] }
        ]
      }
    }
  
  **Example Conversation Flow:**
  - User: "I need to make a presentation about our new software."
  - You: (Returns text response) { "response_type": "text", "content": "Sounds great! Who will you be presenting this to? Are they technical users, executives, or potential customers?" }
  - User: "It's for potential customers."
  - You: (Returns angles response) { "response_type": "angles", "content": { "angles": [...] } }`;

  const user = `This is the current chat history: ${JSON.stringify(chatHistory)}. Please provide your next response based on the rules.`;

  return await callGoogleGemini({ system, user, json: true });
}

// Logic for generating angles
export async function generateStrategicAngles(topic, prefs = {}) {
  const system = `You are a world-class presentation strategist and storytelling expert. You excel at identifying the most compelling narrative angles for any topic. Your output must be a single, valid JSON object with an "angles" array, and nothing else.`;

  const user = `
Generate 4 strategic angles for a presentation on the topic: "${topic}".

**ANGLE SELECTION STRATEGY:**
Choose 4 diverse angles from these proven storytelling frameworks, adapting them to fit the topic:

**Business/Product Topics:**
- "The Innovation Journey" (origin story, evolution, breakthroughs)
- "The Competitive Edge" (market position, differentiators, advantages)
- "The User Impact" (customer success, transformation, value delivered)
- "The Future Vision" (roadmap, emerging trends, next chapter)

**Educational/Informational Topics:**
- "The Foundation" (core concepts, principles, building blocks)
- "The Real-World Application" (practical uses, case studies, examples)
- "The Common Challenges" (problems solved, obstacles overcome)
- "The Expert Insights" (advanced techniques, best practices, pro tips)

**Industry/Market Topics:**
- "The Current Landscape" (market overview, key players, trends)
- "The Transformation Story" (how things have changed, disruption)
- "The Opportunities Ahead" (growth areas, emerging markets, potential)
- "The Strategic Approach" (how to succeed, winning strategies)

**REQUIREMENTS:**
1. Each angle must have a compelling, action-oriented title (4-8 words max)
2. Each angle must include 3 specific, concrete key points (not generic statements)
3. Angles should appeal to different audience interests and learning styles
4. Include visual storytelling potential in your angle selection
5. Ensure angles can support 8-12 slides of rich content each

**ENHANCED SCHEMA WITH VISUAL HINTS:**
{
  "angles": [
    {
      "angle_id": "angle_1_[category]",
      "title": "Compelling Action-Oriented Title",
      "key_points": [
        "Specific, concrete point with measurable impact",
        "Unique insight or surprising fact about the topic",
        "Clear benefit or outcome for the audience"
      ],
      "visual_theme": "suggested visual approach (e.g., 'timeline', 'comparison', 'process', 'data-driven')",
      "audience_appeal": "primary audience motivation (e.g., 'decision-makers', 'technical-experts', 'general-audience')"
    }
  ]
}

Make each angle distinctly different in approach, ensuring the user has genuinely diverse storytelling options.`;

  return await callGoogleGemini({ system, user, json: true });
}

// Logic for generating the blueprint
export async function generateBlueprint(topic, angle, slideCount = 10, prefs = {}) {
  const system = `You are a world-class presentation designer and storyteller. Your task is to create a complete visual and narrative blueprint for a presentation of exactly ${slideCount} slides.

  RULES:
  1.  **Structure is Mandatory:** The blueprint MUST begin with a 'Title' slide (slide 1) and an 'Agenda' slide (slide 2), and end with a 'Closing', 'Thank You', or 'Q&A' slide. This structure is non-negotiable.
  2.  **Angle-Adapted Narrative:** You MUST adapt the narrative flow of the content slides to fit the chosen angle's title: "${angle?.title || ''}".
      - If the angle is historical (e.g., "The Innovation Story"), use a chronological flow.
      - If the angle is persuasive (e.g., "Why We Will Win"), use a Problem/Solution flow.
      - If the angle is explanatory (e.g., "A Guide to our Products"), use a thematic or sequential flow.
  3.  **Visual Design is Key:** For EACH slide, you MUST specify a 'visual_element'. This tells the designer HOW to lay out the content.
  4.  **Image Integration:** For content slides (not Title/Agenda), STRONGLY consider adding an 'image_suggestion' when it would enhance understanding. Be specific about what type of image would work best (e.g., 'professional team meeting', 'modern data visualization', 'futuristic technology concept').
  5.  **Available Visual Elements:** ['TitleSlide', 'Agenda', 'TwoColumn', 'Quote', 'SectionHeader', 'FeatureGrid', 'ProcessDiagram', 'DataChart', 'Timeline', 'ComparisonTable', 'TeamMembers', 'KpiGrid'].

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
 * Generates a complete design system brief with:
 * - Unique theme name
 * - Contrast-aware color palette
 * - Background system recipes
 * - Typography system
 * - Style tokens
 */
export async function generateDesignSystem(topic, angle) {
  const system = `You are a visionary AI Art Director. Create a unique, high-quality design system from scratch that will define the visual DNA of a presentation.

**Your Creative Mandate:**
1. **Theme Identity** - Invent a unique themeName (2-3 words) that captures the essence of the topic
2. **Color System** - Generate a complete colorPalette with:
   - Primary, secondary, and accent colors
   - Background/text pairs meeting WCAG AA contrast
   - Semantic colors (success, warning, danger)
3. **Background Recipes** - Define 3+ advanced background types:
   - Meshes: Complex gradient meshes with 3+ colors
   - Aurora: Soft, organic light effects
   - Noise: Subtle textured backgrounds
   - Glass: Modern frosted glass effects
4. **Typography** - Create a typography system with:
   - Font pairings (heading + body)
   - Text effects (gradients, shadows)
   - Responsive sizing scale
5. **Style Tokens** - Define reusable design tokens for:
   - Borders, shadows, blurs
   - Animation properties
   - Spacing system

**Output Format:**
{
  "themeName": "Unique Theme Name",
  "colorPalette": {
    "primary": {
      "main": "#RRGGBB",
      "light": "#RRGGBB",
      "dark": "#RRGGBB"
    },
    "secondary": {
      "main": "#RRGGBB",
      "light": "#RRGGBB",
      "dark": "#RRGGBB"
    },
    "background": {
      "default": "#RRGGBB",
      "paper": "#RRGGBB"
    },
    "text": {
      "primary": "#RRGGBB",
      "secondary": "#RRGGBB"
    },
    "semantic": {
      "success": "#RRGGBB",
      "warning": "#RRGGBB",
      "danger": "#RRGGBB"
    }
  },
  "backgroundSystem": {
    "types": {
      "mesh": {
        "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB"],
        "angle": 45,
        "intensity": 0.8
      },
      "aurora": {
        "colors": ["#RRGGBB", "#RRGGBB"],
        "blur": 80,
        "opacity": 0.4
      },
      "glass": {
        "blur": 8,
        "opacity": 0.2
      }
    },
    "recipes": {
      "default": {"type": "mesh", "variant": "soft"},
      "title": {"type": "aurora", "variant": "vibrant"},
      "section": {"type": "glass", "variant": "light"}
    }
  },
  "typography": {
    "fontFamilies": {
      "heading": "Font Name",
      "body": "Font Name"
    },
    "textEffects": {
      "headingGradient": {"colors": ["primary.main", "secondary.main"]},
      "textShadow": {"color": "rgba(0,0,0,0.1)", "offset": "1px 1px"}
    }
  },
  "styleTokens": {
    "borderRadius": {
      "small": "4px",
      "medium": "8px",
      "large": "12px"
    },
    "shadows": {
      "small": "0 1px 3px rgba(0,0,0,0.12)",
      "medium": "0 4px 6px rgba(0,0,0,0.1)",
      "large": "0 10px 15px rgba(0,0,0,0.1)"
    },
    "spacing": {
      "unit": 8,
      "section": 64
    }
  },
  "previewColors": {
    "bg": "#RRGGBB",
    "text": "#RRGGBB",
    "accent": "#RRGGBB"
  }
}`;

  const user = `Create a cutting-edge design system for a presentation about:
Topic: "${topic}"
Angle: "${angle?.title || ''}"

Design Direction:
- Should feel modern and professional
- Incorporate visual motifs from the topic
- Ensure excellent readability and accessibility
- Include at least one innovative visual effect`;

  return await callGoogleGemini({ system, user, json: true });
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

    1.  **CHOOSE THE BEST LAYOUT:** Select the MOST appropriate layout from 'availableLayouts' that fits the blueprint's intent:
        - 'TitleSlide': Only for slide 1 (presentation title)
        - 'Agenda': Only for slide 2 (presentation outline)
        - 'TitleAndBulletsLayout': For simple content lists, key points
        - 'TwoColumn': For content with supporting images or side-by-side comparisons
        - 'FeatureGrid': For showcasing 3-4 features, benefits, or services
        - 'ProcessDiagram': For step-by-step processes, workflows, timelines
        - 'DataChart': For statistics, metrics, quantitative data
        - 'ComparisonTable': For feature comparisons, before/after, pros/cons
        - 'FullBleedImageLayout': For impactful section breaks, emotional content
        - 'Quote': For testimonials, key quotes, mission statements
        - 'KpiGrid': For key performance indicators, metrics dashboard
        - 'ContactInfoLayout': Only for final slide (contact/thank you)
        - 'SectionHeader': For major section transitions
        - 'TeamMembers': For introducing team, leadership, speakers

    2.  **EXPAND THE CONTENT (MANDATORY):** Do not just copy the 'content_points'. You MUST elaborate on them.
        - Write an introductory 'body' paragraph (2-3 sentences) that sets the context for the slide.
        - The original 'content_points' should be used as a 'bullets' or 'items' array.

    3.  **GENERATE SPEAKER NOTES (MANDATORY):** For EVERY slide, you MUST write 2-4 sentences of insightful 'speaker_notes'. These should contain extra details, data, or talking points not visible on the slide.

    4.  **CREATE CONTEXTUAL DATA (IF APPLICABLE):** If you choose 'DataChart', 'KpiGrid', or 'ComparisonTable', you MUST generate realistic and contextually relevant data based on the slide's topic. DO NOT use generic placeholder data.

    5.  **SUGGEST CONTEXTUAL ICONS (IF APPLICABLE):** If the layout is 'FeatureGrid' or 'ProcessDiagram', for each item/feature, you MUST suggest a relevant icon name from the 'lucide-react' library (e.g., "TrendingUp", "ShieldCheck", "Users"). Add it as an 'icon' property to each feature object.

    6.  **CREATE ARTISTIC IMAGE PROMPTS:** If the slide requires an image ('TwoColumn', 'FullBleedImageLayout'), create a highly specific and artistic 'image_prompt' based on slide type:
        - For business/corporate slides: 'professional team collaboration, modern office, cinematic lighting'
        - For technology slides: 'futuristic digital interface, holographic displays, neon lighting, 3D render'
        - For data/analytics slides: 'abstract data visualization, flowing charts, geometric patterns, blue tones'
        - For timeline slides: 'journey concept, pathway, progression, minimalist design'
        - For comparison slides: 'balance concept, scales, versus imagery, clean composition'
        - For closing slides: 'success celebration, handshake, achievement, warm lighting'
        - Always include style keywords like 'photorealistic', 'cinematic lighting', 'professional photography', '4K quality', 'modern aesthetic'. Otherwise, set to null.

    7.  **USE LAYOUT OPTIONS DYNAMICALLY:** For the 'TwoColumn' layout, randomly choose to set an 'imagePosition' property to either 'left' or 'right' to create visual variety in the presentation.

    8.  **CHOOSE A BACKGROUND:** Select the most fitting background variant from 'designSystem.gradients'. Use 'background_title' for 'TitleSlide' and 'FullBleedImageLayout'. Use 'background_subtle' for text-heavy slides like 'TitleAndBulletsLayout'. Default to 'background_default' for others.

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
