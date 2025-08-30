// Removed unused import from '@/core/ai' to fix module-not-found error.

// This service is responsible for all interactions with our own /api/ai endpoint.
// It returns data or throws an error. It does not set state.

// --- NON-STREAMING ACTIONS (Remain the same) ---

export async function generateAngles(topic, prefs) {
  const response = await fetch("/api/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "generate_angles", payload: { topic, ...prefs } }),
  });
  if (!response.ok) throw new Error((await response.json()).error || "Failed to generate angles");
  return response.json();
}

export async function generateBlueprint(topic, angle, slideCount, prefs) {
  const response = await fetch("/api/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "generate_blueprint", payload: { topic, angle, slideCount, ...prefs } }),
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

// --- STREAMING CLIENT IMPLEMENTATION ---

export async function generateSlideRecipesStream({
  blueprint,
  topic,
  angle,
  theme,
  onEvent,  // Generic event callback: receives full event objects
  onRecipe, // Back-compat: Callback for each slide recipe that arrives
  onError,  // Callback for any errors during the stream
  onDone,   // Callback when the stream is complete
}) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'generate_recipes_stream', 
        payload: { blueprint, topic, angle, theme } 
      }),
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
            // Generic handler first
            if (onEvent) onEvent(event);
            // Back-compat branches
            if (event.type === 'recipe' && onRecipe) {
              onRecipe(event.recipe, event.index);
            } else if (event.type === 'error' && onError) {
              onError(event.message || 'An error occurred during generation.');
            }
          } catch (_) { /* ignore partial/invalid lines */ }
        }
      }
    }
  } catch (e) {
    if (onError) onError(e.message || 'Stream error');
  }
}
