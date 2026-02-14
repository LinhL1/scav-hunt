/**
 * src/lib/ai/analyzePhoto.ts
 */

import { callGemini, fileToBase64 } from "./geminiClient";

export interface PhotoAnalysisResult {
  matches: boolean;
  feedback: string;
}

function extractJson(raw: string): PhotoAnalysisResult | null {
  try {
    // Strip markdown fences
    const stripped = raw.replace(/```json|```/gi, "").trim();

    // Try full parse first
    const start = stripped.indexOf("{");
    if (start === -1) return null;

    // If the JSON is truncated, attempt to recover by extracting
    // the "matches" and "feedback" values with regex instead
    const matchesMatch = stripped.match(/"matches"\s*:\s*(true|false)/);
    const feedbackMatch = stripped.match(/"feedback"\s*:\s*"((?:[^"\\]|\\.)*)"/);

    if (matchesMatch && feedbackMatch) {
      return {
        matches: matchesMatch[1] === "true",
        feedback: feedbackMatch[1],
      };
    }

    // Last resort — try JSON.parse on what we have
    const end = stripped.lastIndexOf("}");
    if (end !== -1) {
      const parsed = JSON.parse(stripped.slice(start, end + 1));
      if (typeof parsed.matches === "boolean" && typeof parsed.feedback === "string") {
        return parsed as PhotoAnalysisResult;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function analyzePhoto(
  prompt: string,
  _unused: string,
  imageFile?: File | Blob
): Promise<PhotoAnalysisResult> {
  if (!imageFile) {
    return { matches: false, feedback: "ERROR: No image file received." };
  }

  try {
    const base64 = await fileToBase64(imageFile);
    const mimeType = imageFile.type || "image/jpeg";

    const raw = await callGemini({
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: base64 } },
            {
              text: `You are a strict judge for a photo scavenger hunt. The prompt is: "${prompt}". Does this photo clearly show "${prompt}"? Be strict — when in doubt say no. Reply ONLY with this JSON and nothing else: {"matches": true, "feedback": "your feedback here"} or {"matches": false, "feedback": "your feedback here"}. Keep feedback under 20 words.`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
    });

    const result = extractJson(raw);

    if (!result) {
      return {
        matches: false,
        feedback: `ERROR: Could not parse response. Raw: "${raw}"`,
      };
    }

    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { matches: false, feedback: `ERROR: ${message}` };
  }
}