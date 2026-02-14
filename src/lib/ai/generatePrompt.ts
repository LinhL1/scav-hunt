// /**
//  * src/lib/ai/generatePrompt.ts
//  *
//  * Generates 3 distinct daily photo prompts via Gemini.
//  * Cached per day so only 1 API call is made regardless of re-renders.
//  * Falls back to 3 picks from mockPrompts if the API fails.
//  */

// import { callGemini } from "./geminiClient";
// import { mockPrompts } from "../mock-data";

// let cachedPrompts: string[] | null = null;
// let cachedDate: string | null = null;

// function todayKey(): string {
//   return new Date().toISOString().slice(0, 10);
// }

// function fallback(): string[] {
//   const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
//   return [0, 1, 2].map((offset) => mockPrompts[(dayIndex + offset) % mockPrompts.length]);
// }

// /** Returns 3 prompt strings for today */
// export async function generatePrompts(): Promise<string[]> {
//   const today = todayKey();
//   if (cachedPrompts && cachedDate === today) return cachedPrompts;

//   try {
//     const raw = await callGemini({
//       contents: [
//         {
//           parts: [
//             {
//               text: `You are a creative director for a daily photo scavenger hunt app.
// Generate exactly 3 distinct, short, evocative photo prompts for today.

// Rules:
// - Each prompt is 1–4 words only (e.g. "Golden hour", "Something tiny", "Your hands")
// - All 3 must be different themes — one nature, one everyday object, one abstract/emotional
// - Should be achievable anywhere — indoors or outdoors
// - Do NOT add punctuation, numbering, quotes, or explanation
// - Respond with ONLY valid JSON — an array of 3 strings, nothing else:
// ["prompt one", "prompt two", "prompt three"]

// Today's date: ${today}`,
//             },
//           ],
//         },
//       ],
//       generationConfig: { temperature: 0.9, maxOutputTokens: 80 },
//     });

//     const cleaned = raw.replace(/```json|```/gi, "").trim();
//     const start = cleaned.indexOf("[");
//     const end = cleaned.lastIndexOf("]");
//     if (start === -1 || end === -1) throw new Error("No array in response");

//     const parsed = JSON.parse(cleaned.slice(start, end + 1)) as string[];
//     if (!Array.isArray(parsed) || parsed.length < 3) throw new Error("Bad array");

//     cachedPrompts = parsed.slice(0, 3);
//     cachedDate = today;
//     return cachedPrompts;
//   } catch (err) {
//     console.warn("generatePrompts: falling back to mock.", err);
//     return fallback();
//   }
// }

// /** Legacy single-prompt helper — returns the first of the 3 prompts */
// export async function generatePrompt(): Promise<string> {
//   const prompts = await generatePrompts();
//   return prompts[0];
// }
/**
 * src/lib/ai/generatePrompt.ts
 *
 * Uses hardcoded mockPrompts for now.
 * Gemini integration is ready to re-enable — just swap the body of
 * generatePrompts() back to the Gemini call when needed.
 */

import { mockPrompts } from "../mock-data";

/** Returns 3 distinct prompts for today based on the current date */
export async function generatePrompts(): Promise<string[]> {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return [0, 1, 2].map(
    (offset) => mockPrompts[(dayIndex + offset) % mockPrompts.length]
  );
}

/** Legacy single-prompt helper — returns the first of the 3 */
export async function generatePrompt(): Promise<string> {
  const prompts = await generatePrompts();
  return prompts[0];
}