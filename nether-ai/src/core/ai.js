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
    const system = `You are an expert content researcher and writer. Your task is to generate a comprehensive, high-quality block of text that will serve as the raw material for a presentation. Do not structure it into slides. Just provide the core information.`;

    const user = `
    Please generate a rich, detailed block of text for a ${slideCount}-slide presentation on the topic: "${topic}".
    The chosen narrative angle is: "${angle?.title || 'Not specified'}".
    The target audience is: "${audience || 'General'}".
    The objective is: "${objective || 'To inform'}".

    Your text should include all the key points, facts, data, and narrative elements needed to build the entire presentation. Structure your response as a series of paragraphs, covering all necessary aspects of the topic from introduction to conclusion. This is a "brain dump" of all the information needed.
    
    **Output only the raw text, with no JSON formatting.**`;

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
    2.  **VALID LAYOUTS ONLY:** For the \`visual_element.type\`, you MUST ONLY use a value from this list: ['TitleSlide', 'Agenda', 'TwoColumn', 'Quote', 'SectionHeader', 'FeatureGrid', 'ProcessDiagram', 'DataChart', 'Timeline', 'ComparisonTable', 'TeamMembers', 'KpiGrid', 'FullBleedImageLayout', 'TitleAndBulletsLayout', 'ContactInfoLayout'].
    3.  **GUARANTEE STRUCTURE:** The first slide must be 'TitleSlide', the second 'Agenda', and the last a closing slide.
    
    **OUTPUT SCHEMA (Follow this pattern exactly):**
    {
      "slides": [
        {
          "slide_id": "slide_1",
          "slide_title": "Slide Title Here",
          "objective": "Objective of this slide.",
          "slide_summary": "A rich, detailed paragraph created by selecting and rephrasing sentences from the provided research content. This must not be a simple list.",
          "visual_element": { "type": "A valid layout type from the list" }
        }
      ]
    }`;

    return await callGoogleGemini({ system, user, json: true });
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
  const system = `You are a visionary AI Art Director with a keen eye for modern, professional design. Create a unique, high-quality design system from scratch that will define the visual DNA of a presentation. Your output must be a single, valid JSON object.`;

  const user = `Create a cutting-edge design system for a presentation on the topic: "${topic}" with the angle: "${angle?.title || ''}".

**CRITICAL TASKS:**
1.  **Infer Art Direction:** From the topic, first infer an appropriate artistic direction (e.g., 'Corporate & Professional', 'Minimalist & Calm', 'Bold & Energetic'). This direction must guide your font and color choices.
2.  **Generate Sophisticated Colors:**
    -   Create a complete, harmonious color palette.
    -   **Intelligent Text Color Rule:** Based on the \`background.default\` color you choose, you MUST generate a \`text.primary\` color that is NOT pure \`#000000\` or \`#FFFFFF\`. It must have a WCAG AA contrast ratio and be a dark, desaturated shade of the primary or secondary color to create a more professional, modern look.
3.  **Define Backgrounds & Fonts:** Define advanced background recipes and select professional font pairings that match the art direction.
4.  **Provide Tokens:** Define standard style tokens for borders, shadows, and spacing.

**OUTPUT SCHEMA (must be exact):**
{
  "themeName": "Unique Theme Name",
  "colorPalette": { "primary": { "main": "#RRGGBB", "light": "#RRGGBB", "dark": "#RRGGBB" }, "secondary": { "main": "#RRGGBB", "light": "#RRGGBB", "dark": "#RRGGBB" }, "background": { "default": "#RRGGBB", "paper": "#RRGGBB" }, "text": { "primary": "#RRGGBB", "secondary": "#RRGGBB" }, "semantic": { "success": "#RRGGBB", "warning": "#RRGGBB", "danger": "#RRGGBB" }},
  "backgroundSystem": { "types": { "mesh": { "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB"], "angle": 45 }, "aurora": { "colors": ["#RRGGBB", "#RRGGBB"], "blur": 80, "opacity": 0.4 }}, "recipes": { "default": {"type": "mesh", "variant": "soft"}, "title": {"type": "aurora", "variant": "vibrant"}}},
  "typography": { "fontFamilies": { "heading": "Font Name", "body": "Font Name" }},
  "styleTokens": { "borderRadius": { "medium": "8px" }, "shadows": { "medium": "0 4px 6px rgba(0,0,0,0.1)"}, "spacing": { "unit": 8 }},
  "previewColors": { "bg": "#RRGGBB", "text": "#RRGGBB", "accent": "#RRGGBB" }
}`;

  return await callGoogleGemini({ system, user, json: true });
}

// "Content Strategist" prompt that correctly uses the rich summary
export async function generateRecipeForSlide(slideBlueprint, topic, designSystem, { audience, tone, objective }) {
  const system = `You are an expert Content Strategist and Information Designer. Your task is to transform a detailed slide blueprint into a rich, complete, and engaging slide recipe. You MUST follow all rules and output only valid JSON.`;

  const user = `
    "designSystem": ${JSON.stringify(designSystem || {})}
    "slideBlueprint": ${JSON.stringify(slideBlueprint || {})}
    "availableLayouts": ["TitleSlide", "Agenda", "SectionHeader", "TwoColumn", "FeatureGrid", "ProcessDiagram", "DataChart", "Timeline", "ComparisonTable", "Quote", "KpiGrid", "FullBleedImageLayout", "TitleAndBulletsLayout", "ContactInfoLayout", "TeamMembers"]

    **CONTEXT:**
    - **Audience:** "${audience || 'General'}"
    - **Tone:** "${tone || 'Professional'}"
    - **Objective:** "${objective || 'To inform'}"

    **CRITICAL CONTENT STRATEGY INSTRUCTIONS:**

    1.  **MANDATORY PROPS OBJECT:** You MUST structure your response so that all generated content for the slide (titles, body text, bullets, lists, data, etc.) is placed within a nested JSON object under the key \`props\`. This is a non-negotiable rule.
    2.  **Core Task: Arrange the Summary:** Your main task is to artistically arrange the content from the provided \`slide_summary\` into a visually balanced and informative slide. You are not just expanding points; you are translating a detailed plan into a final product.
    3.  **Enforce Content Variety:** Create a mix of content formats. For some slides, use a short introductory paragraph followed by 3-4 key bullet points. For others, a well-written, concise paragraph of 3-5 lines is more effective.
    4.  **GUARANTEE NO EMPTY SLIDES:** Under no circumstances should a slide be returned with empty content fields inside \`props\`. The \`slide_summary\` provides all the information you need.
    5.  **WRITE INSIGHTFUL SPEAKER NOTES:** For EVERY slide, write 2-4 sentences of 'speaker_notes' containing extra details.
    6.  **CREATE ARTISTIC IMAGE PROMPTS:** If an image is needed, create a specific 'image_prompt'. Otherwise, set to null.

    **YOUR RESPONSE MUST BE A SINGLE, VALID JSON OBJECT. NO MARKDOWN, NO COMMENTARY.**
  `;

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