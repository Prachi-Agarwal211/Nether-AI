// src/core/ai.js
import { AI_CONFIG, getHeaders } from './ai-config';
import { generateImagePublicUrl } from './image-generation';
import toast from 'react-hot-toast';
export { generateImagePublicUrl };

// [FIXED] Universal helper with robust JSON parsing and error handling
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
        const errorBody = await response.text();
        throw new Error(`Google Gemini API error: ${response.status} ${response.statusText} | Body: ${errorBody}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        if (attempt < retries) continue; // Retry if response is empty
        throw new Error('Empty response from AI');
      }

      if (json) {
        try {
          return JSON.parse(rawText);
        } catch (parseError) {
          console.error("--- AI JSON PARSE FAILED ---");
          console.error("Raw AI Response:", rawText);
          console.error("Parse Error:", parseError);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue; // Retry on parse failure
          }
          throw new Error('AI returned invalid JSON format.');
        }
      }

      return rawText; // Return plain text if json=false

    } catch (error) {
      console.error(`AI request failed on attempt ${attempt}/${retries}:`, error.message);
      if (attempt === retries) {
        toast.error(`AI request failed: ${error.message}`);
        throw error;
      }
      toast(`AI request error (attempt ${attempt}/${retries}), retrying...`, { icon: '🔄' });
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Logic for conversational interaction with strict angle generation rules
export async function haveConversation(chatHistory) {
  const system = `You are Nether AI, an expert presentation strategist. Your goal is to help users craft the perfect presentation by having a natural, friendly conversation.

  **Your Core Task:**
  Your primary goal is to understand three key things before generating ideas:
  1.  **Topic:** What is the presentation about?
  2.  **Audience:** Who is this presentation for? (e.g., investors, students, executives)
  3.  **Objective:** What is the goal of this presentation? (e.g., to get funding, to educate, to sell a product)

  **Your Process:**
  1.  **Engage and Clarify:** If the user only provides a topic, ask clarifying questions to understand the Audience and Objective. Be concise and helpful.
  2.  **Analyze and Extract:** As the user responds, identify and extract the topic, audience, and objective from the conversation.
  3.  **Proceed When Ready:** Once you have a reasonable understanding of the Topic, Audience, and Objective, you can generate strategic angles.
  4.  **Fallback:** If the user is not providing details, make a reasonable assumption based on the topic and proceed.

  **Output Format Rules:**
  - Your entire response MUST be a single, valid JSON object.
  - **While conversing:** Use this format. If you have extracted any context, include it.
    {
      "response_type": "text",
      "content": "Your text response here.",
      "context": {
        "topic": "The identified topic, if any",
        "audience": "The identified audience, if any",
        "objective": "The identified objective, if any"
      }
    }
  - **When ready to provide angles:** Use this format, and follow the angle generation rules precisely.
    {
      "response_type": "angles",
      "content": {
        "angles": [
          { "angle_id": "angle_1", "title": "...", "key_points": ["...", "...", "..."] },
          { "angle_id": "angle_2", "title": "...", "key_points": ["...", "...", "..."] },
          { "angle_id": "angle_3", "title": "...", "key_points": ["...", "...", "..."] },
          { "angle_id": "angle_4", "title": "...", "key_points": ["...", "...", "..."] }
        ]
      }
    }
    
  **CRITICAL RULES FOR ANGLE GENERATION:**
  - **YOU MUST GENERATE EXACTLY 4 ANGLES.** Your work will be rejected if the count is not four.
  - Before responding, verify that the 'angles' array contains exactly four distinct items.
  - Each angle must have a compelling title and 3 specific key points.
  - Tailor the angles to the audience and objective you have identified.`;

  const user = `This is the current chat history: ${JSON.stringify(chatHistory)}. Please provide your next response based on the rules.`;

  return await callGoogleGemini({ system, user, json: true });
}

// --- [NEW ARCHITECTURE] BLUEPRINT GENERATION ---

// STEP 1: The AI acts as a researcher to generate a rich "brain dump" of content.
async function generateOutlineContent(topic, angle, slideCount, { audience, objective }) {
    const system = `You are an expert content researcher creating material for professional presentations. Generate a comprehensive 500-800 word essay covering all aspects of the topic that could be used to create ${slideCount} slides. Follow these rules:

1. Write in continuous prose with 4-8 sentence paragraphs
2. Include concrete facts, statistics, examples and case studies
3. Cover all key aspects from introduction to conclusion
4. Absolutely NO bullet points or slide titles
5. Maintain a professional tone appropriate for ${audience || 'a general audience'}`;

    const user = `Create a detailed research document about "${topic}" with the angle: "${angle?.title || 'Not specified'}". The presentation's objective is: "${objective || 'To inform'}".

Include:
- Background context and importance
- Key facts and data points
- Current challenges/opportunities
- Relevant examples or case studies
- Future outlook or recommendations

Output only the raw text content with no JSON formatting or section headers.`;

    return await callGoogleGemini({ system, user, json: false });
}

// STEP 2: The AI acts as a structurer, organizing the rich content into a blueprint.
async function generateBlueprintFromContent(topic, angle, slideCount, contentBlock, { audience, tone, objective }) {
    const system = `You are an expert presentation outliner. You will be given a block of pre-written content. Your ONLY task is to structure this content into a detailed blueprint for a presentation of exactly ${slideCount} slides. You must follow the schema precisely.`;

    const user = `
    **Pre-written Research Content:**
    ---
    ${contentBlock}
    ---

    **Your Task:**
    Structure the content above into a blueprint for a ${slideCount}-slide presentation on the topic "${topic}".

    **CRITICAL INSTRUCTIONS:**
    1.  **Use the Provided Content:** You MUST create the \`slide_summary\` for each slide by selecting, combining, and rephrasing sentences and ideas **directly from the research content provided**. This is your source of truth.
    2.  **Extract Key Points:** For each slide, extract 2-4 key points from the summary and include them as \`content_points\`.
    3.  **VALID LAYOUTS ONLY:** For the \`visual_element.type\`, you MUST ONLY use a value from this list: ['TitleSlide', 'Agenda', 'TwoColumn', 'Quote', 'SectionHeader', 'FeatureGrid', 'ProcessDiagram', 'DataChart', 'Timeline', 'ComparisonTable', 'TeamMembers', 'KpiGrid', 'FullBleedImageLayout', 'TitleAndBulletsLayout', 'ContactInfoLayout'].
    4.  **GUARANTEE STRUCTURE:** The first slide must be 'TitleSlide', the second 'Agenda', and the last a closing slide.
    
    **OUTPUT SCHEMA:**
    {
      "slides": [
        {
          "slide_id": "slide_1",
          "slide_title": "Slide Title Here",
          "objective": "Objective of this slide.",
          "slide_summary": "A rich, detailed paragraph created by selecting and rephrasing sentences from the provided research content.",
          "content_points": ["Key point 1", "Key point 2"],
          "visual_element": { "type": "A valid layout type from the list" }
        }
      ]
    }`;

    const richBlueprint = await callGoogleGemini({ system, user, json: true });
    
    // --- Agenda auto-injection ---
    const agendaSlide = richBlueprint?.slides?.[1];
    if (agendaSlide && agendaSlide.visual_element?.type === 'Agenda') {
      const talkTitles = richBlueprint.slides.slice(2).map(s => s.slide_title);
      agendaSlide.slide_summary =
        'This presentation will guide you through: ' +
        talkTitles.join(', ') + '.';
      agendaSlide.content_points = talkTitles;
    }
    
    return richBlueprint;
}

// COORDINATOR: The main blueprint function now orchestrates the new two-step process.
export async function generateBlueprint(topic, angle, slideCount = 10, context) {
    // Step 1: Generate the rich, unstructured content block.
    console.log('[Blueprint] Step 1: Generating raw content...');
    const contentBlock = await generateOutlineContent(topic, angle, slideCount, context);

    // Step 2: Structure the rich content into a high-quality blueprint.
    console.log('[Blueprint] Step 2: Structuring content into blueprint...');
    const richBlueprint = await generateBlueprintFromContent(topic, angle, slideCount, contentBlock, context);
    
    console.log('[Blueprint] Finished creating rich blueprint.');
    return { topic, ...richBlueprint };
}


// Logic for refining the blueprint
export async function refineBlueprint(blueprint, message, chatHistory = []) {
  const system = `You are a helpful presentation editor. The user wants to refine their blueprint. Apply their requested changes. Return the FULL, updated blueprint JSON only (no commentary). Preserve all slide_ids.`;
  const user = JSON.stringify({ blueprint, request: message, chatHistory: chatHistory.slice(-4) });
  
  return await callGoogleGemini({ system, user, json: true });
}

// "Art Director" prompt for generating sophisticated design systems
export async function generateDesignSystem(topic, angle) {
  const system = `You are a world-class Art Director with a sophisticated eye for modern design. Your only job is to create a complete, unique, and high-quality design system. Your output MUST be a single, valid JSON object.`;

  const user = `
    For a presentation on "${topic}", create a new and unique design system.

    **STEP 1: CHOOSE A CREATIVE SEED (MANDATORY)**
    To guarantee variety, you MUST first randomly choose ONE artistic style from this list:
    ['Corporate & Professional', 'Minimalist & Calm', 'Bold & Energetic', 'Elegant & Sophisticated', 'Futuristic & Techy', 'Natural & Organic'].

    **STEP 2: BUILD THE THEME**
    Based on your chosen style, generate the entire design system. ALL choices for colors, fonts, and backgrounds MUST align with that style.

    **CRITICAL REQUIREMENTS:**
    1.  **Color Palette:** Generate a complete, harmonious color palette.
    2.  **Readability:** The \`text.primary\` color MUST have a strong WCAG AA contrast ratio against the \`background.default\`.
    3.  **Background System:** The \`backgroundSystem.recipes\` object MUST contain 'default' (subtle), 'title' (vibrant), and 'gradient' (linear gradient) recipes.

    **OUTPUT SCHEMA (must be exact):**
    {
      "themeName": "Unique Name",
      "colorPalette": { /*...*/ },
      "backgroundSystem": {
        "types": { /*...*/ },
        "recipes": {
          "default": {"type": "...", "variant": "..."},
          "title": {"type": "...", "variant": "..."},
          "gradient": {"type": "gradient", "variant": "..."}
        }
      }
      /*...*/
    }`;

  return await callGoogleGemini({ system, user, json: true });
}

// "Content Strategist" prompt that correctly uses the rich summary
export async function generateRecipeForSlide(slideBlueprint, topic, designSystem, { audience, tone, objective }) {
  const system = `You are an expert Content Creator and Information Designer. Your job is to transform the raw information in the 'slide_summary' into a polished, engaging, and complete slide. You are synthesizing and arranging information like a professional designer. Your output must be a single, valid JSON object.`;

  const user = `
    "designSystem": ${JSON.stringify(designSystem || {})}
    "slideBlueprint": ${JSON.stringify(slideBlueprint || {})}
    "context": ${JSON.stringify({ audience, tone, objective } || {})}

    **CRITICAL TASK: SYNTHESIZE & ARRANGE CONTENT WITH VISUAL VARIETY**

    1.  **ANALYZE & SYNTHESIZE CONTENT:**
        -   Read the \`slide_summary\` paragraph. Your main job is to **create the slide's content** based on this summary.
        -   Synthesize a compelling 'title' for the slide.
        -   Write a concise 'body' paragraph (2-3 sentences) that introduces the slide's topic.
        -   Generate a 'bullets' array with 3-5 key points, eloquently rephrased for impact.
        -   If the summary contains data (numbers, comparisons, steps), structure it into the appropriate data prop (\`chartData\`, \`kpis\`, \`items\`, \`steps\`). Do not invent data, but you must format it.

    2.  **CHOOSE LAYOUT & STYLE:**
        -   Based on the content you just synthesized, select the most appropriate \`layout_type\`.
        -   To ensure visual diversity, choose a layout \`variant\` (e.g., 'cards', 'split') and add it to the \`props\` object.
        -   Choose the best \`backgroundVariant\` ('default', 'title', 'gradient') for this slide's purpose.

    3.  **UNIVERSAL RULES:**
        -   Under NO circumstances should any prop be empty. Generate all necessary content.
        -   Generate a creative 'image_prompt' if applicable and detailed 'speaker_notes'.

    **YOUR RESPONSE MUST BE A SINGLE, VALID JSON OBJECT. NO MARKDOWN, NO COMMENTARY.**
  `;

  return await callGoogleGemini({ system, user, json: true });
}

// Generate strategic angles for presentations
export async function generateStrategicAngles(topic, context) {
  const system = `You are Nether AI, an expert presentation strategist. Generate exactly 4 unique strategic angles for presenting the topic "${topic}".
  
  **Rules:**
  1. Each angle must take a distinct perspective
  2. Tailor angles to ${context?.audience || 'the target audience'}
  3. Align with objective: ${context?.objective || 'to inform'}
  4. Return exactly 4 angles in this format:
  {
    "angles": [
      {
        "angle_id": "angle_1",
        "title": "...",
        "key_points": ["...", "...", "..."]
      },
      // 3 more angles
    ]
  }`;

  const user = `Generate 4 strategic angles for presenting: "${topic}"`;
  
  return await callGoogleGemini({ system, user, json: true });
}

// Logic for refining a single slide recipe
export async function refineSlideRecipe(slideRecipe, message) {
    const system = `You are an expert slide editor AI. You will be given a JSON object representing a single presentation slide and a user's instruction for how to change it. Your task is to intelligently modify the JSON object to fulfill the user's request and return only the updated, valid JSON object.

    **RULES:**
    1.  **Modify, Don't Replace:** Analyze the user's request and apply the changes directly to the provided JSON.
    2.  **Maintain Schema:** The returned JSON object must have the exact same structure as the input (layout_type, props, speaker_notes, etc.).
    3.  **Handle Content Changes:** Modify the 'title', 'body', and 'bullets' properties within the 'props' object as requested.
    4.  **Return Only JSON:** Your entire output must be the raw, updated JSON object, with no commentary or markdown.`;

    const user = `
    Here is the current slide's JSON recipe:
    ${JSON.stringify(slideRecipe)}

    Here is the user's instruction:
    "${message}"

    Now, return the modified JSON object.`;
    
    return await callGoogleGemini({ system, user, json: true });
}