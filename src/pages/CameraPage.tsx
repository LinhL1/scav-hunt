/**
 * src/pages/CameraPage.tsx
 */

import { submitPhoto } from "@/lib/submissions";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generatePrompt } from "@/lib/ai/generatePrompt";
import { analyzePhoto } from "@/lib/ai/analyzePhoto";
import { summarizeImage } from "@/lib/ai/summarizeImage";
import { currentUser, addUserSubmission } from "@/lib/mock-data";
import CameraCapture from "@/components/CameraCapture";
import PhotoPreview from "@/components/PhotoPreview";
import SubmissionSuccess from "@/components/SubmissionSuccess";
import SubmissionRejected from "@/components/SubmissionRejected";

type CameraState = "capture" | "preview" | "analyzing" | "success" | "rejected";

const ANALYZING_MESSAGES = [
  "Analyzing your photo...",
  "Checking the prompt...",
  "Reviewing composition...",
  "Almost there...",
];

export default function CameraPage() {
  const [state, setState] = useState<CameraState>("capture");
  const [prompt, setPrompt] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [feedback, setFeedback] = useState("");
  const [altText, setAltText] = useState("");
  const [analyzingMessage, setAnalyzingMessage] = useState(ANALYZING_MESSAGES[0]);

  const imageFileRef = useRef<File | null>(null);
  const analyzingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const selected = sessionStorage.getItem("sh_selected_prompt");
    if (selected) {
      setPrompt(selected);
      sessionStorage.removeItem("sh_selected_prompt");
    } else {
      generatePrompt().then(setPrompt);
    }
  }, []);

  // Cycle through analyzing messages while waiting
  useEffect(() => {
    if (state === "analyzing") {
      let i = 0;
      analyzingIntervalRef.current = setInterval(() => {
        i = (i + 1) % ANALYZING_MESSAGES.length;
        setAnalyzingMessage(ANALYZING_MESSAGES[i]);
      }, 1200);
    } else {
      if (analyzingIntervalRef.current) {
        clearInterval(analyzingIntervalRef.current);
      }
    }
    return () => {
      if (analyzingIntervalRef.current) {
        clearInterval(analyzingIntervalRef.current);
      }
    };
  }, [state]);

  const handleCapture = useCallback((file: File) => {
    imageFileRef.current = file;
    setPhotoUrl(URL.createObjectURL(file));
    setState("preview");
  }, []);

  const handleSubmit = useCallback(
  async (caption: string) => {
    console.log("🔵 handleSubmit called");
    setState("analyzing");
    setAnalyzingMessage(ANALYZING_MESSAGES[0]);

    try {
      const imageFile = imageFileRef.current;
      if (!imageFile) {
        console.log("❌ No image file");
        return;
      }

      console.log("🔵 Starting analysis...");
      const [analysis, generatedAlt] = await Promise.all([
        analyzePhoto(prompt, "", imageFile),
        summarizeImage(imageFile, prompt),
      ]);

      console.log("✅ Analysis complete:", analysis);
      setFeedback(analysis.feedback);
      setAltText(generatedAlt);

      if (analysis.matches) {
        console.log("🔵 Photo matches! Uploading to Firebase...");
        
        const today = new Date().toISOString().split('T')[0];
        
        await submitPhoto({
          userId: currentUser.id,
          username: currentUser.name,
          userAvatar: currentUser.avatar,
          promptId: "prompt_1",
          promptText: prompt,
          promptDate: today,
          photo: imageFile,
          caption: caption.trim(),
          isValid: analysis.matches,
          aiFeedback: analysis.feedback,
          altText: generatedAlt,
        });
        
        console.log("✅ Uploaded to Firebase!");
        setState("success");
      } else {
        console.log("❌ Photo rejected");
        setState("rejected");
      }
    } catch (err) {
      console.error("❌ Submission error:", err);
      setState("success");
    }
  },
  [prompt]
);

  const handleRetry = useCallback(() => {
    imageFileRef.current = null;
    setPhotoUrl("");
    setFeedback("");
    setAltText("");
    setState("capture");
  }, []);

  const handleBack = useCallback(() => {
    imageFileRef.current = null;
    setPhotoUrl("");
    setState("capture");
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-12">
      <div className="w-full max-w-sm">
        {prompt && state === "capture" && (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Today's prompt:{" "}
            <span className="font-bold text-foreground">{prompt}</span>
          </p>
        )}

        <AnimatePresence mode="wait">
          {state === "capture" && (
            <CameraCapture key="capture" onCapture={handleCapture} />
          )}

          {state === "preview" && (
            <PhotoPreview
              key="preview"
              photoUrl={photoUrl}
              prompt={prompt}
              onSubmit={handleSubmit}
              onBack={handleBack}
              submitting={false}
            />
          )}

          {state === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Blurred photo behind the analysis UI */}
              <div className="relative w-full overflow-hidden rounded-2xl shadow-elevated">
                <img
                  src={photoUrl}
                  alt="Your photo being analyzed"
                  className="aspect-square w-full object-cover blur-sm scale-105 brightness-75"
                />
                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
                  {/* Spinner */}
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-primary-foreground/30 border-t-primary-foreground" />
                    <div className="h-8 w-8 rounded-full gradient-warm shadow-soft" />
                  </div>

                  {/* Cycling message */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={analyzingMessage}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="text-center text-base font-semibold text-primary-foreground"
                    >
                      {analyzingMessage}
                    </motion.p>
                  </AnimatePresence>

                  <p className="text-center text-xs text-primary-foreground/70">
                    Checking against{" "}
                    <span className="font-semibold">"{prompt}"</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {state === "success" && (
            <SubmissionSuccess
              key="success"
              feedback={feedback}
              photoUrl={photoUrl}
              altText={altText}
            />
          )}

          {state === "rejected" && (
            <SubmissionRejected
              key="rejected"
              feedback={feedback}
              photoUrl={photoUrl}
              prompt={prompt}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}