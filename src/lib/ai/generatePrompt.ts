/**
 * src/lib/ai/generatePrompt.ts
 *
 * Uses Gemini to generate a fresh creative photo prompt each day.
 * Falls back to the mock list if the API call fails.
 */

import { callGemini } from "./GeminiClient";
import { mockPrompts } from "../mock-data";

// ---------- Helpers ----------

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function fallback(): string {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return mockPrompts[dayIndex % mockPrompts.length];
}

// ---------- Main Function ----------

export async function generatePrompt(): Promise<string> {
  const today = todayKey();

  // Check localStorage cache first (prevents hot reload regen)
  const stored = localStorage.getItem("dailyPrompt");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);

      if (parsed.date === today && parsed.prompt) {
        console.log("Using cached prompt:", parsed.prompt);
        return parsed.prompt;
      }
    } catch (err) {
      console.warn("Failed to parse stored prompt");
    }
  }

  console.log("Calling Gemini for date:", today);

  try {
    const result = await callGemini({
      contents: [
        {
          parts: [
            {
              text: `You are a creative director for a daily photo scavenger hunt app.
Generate a single short, evocative photo prompt for today.

Rules:
- 1–4 words only (e.g. "Golden hour", "Something tiny", "Your hands")
- Should be achievable anywhere — indoors or outdoors
- Spark curiosity or a moment of noticing something beautiful
- Do NOT add punctuation, quotes, or explanation — just the prompt itself

Today's date: ${today}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 20,
      },
    });

    const prompt = result?.trim() || fallback();

    // Save to localStorage
    localStorage.setItem(
      "dailyPrompt",
      JSON.stringify({
        date: today,
        prompt,
      })
    );

    return prompt;
  } catch (err) {
    console.warn("Gemini call failed, using fallback.", err);

    const prompt = fallback();

    localStorage.setItem(
      "dailyPrompt",
      JSON.stringify({
        date: today,
        prompt,
      })
    );

    return prompt;
  }
}