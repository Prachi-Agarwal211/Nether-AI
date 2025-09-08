// This service is responsible for all interactions with our own /api/ai endpoint.
// It returns data or throws an error. It does not set state.

// --- CONVERSATIONAL ACTION ---

export async function continueConversation(chatHistory) {
  const response = await fetch("/api/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "converse", payload: { chatHistory } }),
  });
  if (!response.ok) throw new Error((await response.json()).error || "Failed to get AI response");
  return response.json();
}

// --- NON-STREAMING ACTIONS ---

export async function generateAngles(topic, context) {
  const response = await fetch("/api/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "generate_angles", payload: { topic, ...context } }),
  });
  if (!response.ok) throw new Error((await response.json()).error || "Failed to generate angles");
  return response.json();
}

export async function generateBlueprint(topic, angle, slideCount, context) {
  const response = await fetch("/api/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "generate_blueprint", payload: { topic, angle, slideCount, ...context } }),
  });
  if (!response.ok) throw new Error((await response.json()).error || "Failed to generate blueprint");
  return response.json();
}

export async function refineBlueprint(blueprint, message, chatHistory) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "refine_blueprint", payload: { blueprint, message, chatHistory } }),
  });
  if (!response.ok) {
    let err = 'Failed to refine blueprint';
    try { const j = await response.json(); err = j.error || err; } catch {}
    throw new Error(err);
  }
  return response.json();
}

// [NEW] Action for refining a single slide
export async function refineSlide(slideRecipe, message) {
    const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refine_slide", payload: { slideRecipe, message } }),
    });
    if (!response.ok) {
        let err = 'Failed to refine slide';
        try { const j = await response.json(); err = j.error || err; } catch {}
        throw new Error(err);
    }
    return response.json();
}

// --- STREAMING CLIENT IMPLEMENTATION ---

export async function generateSlideRecipesStream({
  blueprint, topic, angle, context, onEvent, onDone
}) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_recipes_stream', payload: { blueprint, topic, angle, ...context } }),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to start slide generation stream.");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) { if (onDone) onDone(); break; }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.substring(6);
          try {
            const event = JSON.parse(json);
            if (onEvent) onEvent(event);
          } catch (_) { /* ignore partial/invalid lines */ }
        }
      }
    }
  } catch (e) {
    if (onEvent) onEvent({ type: 'error', message: e.message || 'Stream error' });
  }
}