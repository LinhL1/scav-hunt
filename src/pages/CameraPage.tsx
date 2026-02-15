/**
 * src/pages/CameraPage.tsx
 * Retro carnival–themed camera page
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
  "Developing your shot...",
  "Checking the prompt...",
  "Reviewing composition...",
  "Almost ready...",
];

// ─── Retro ticket banner for the current prompt ─────────────────────────────
function PromptBanner({ prompt }: { prompt: string }) {
  const w = 320;
  const h = 64;
  const nr = 9; // notch radius
  const r = 10; // corner radius
  const ny = h / 2;

  const path = `
    M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r}
    L ${w} ${ny - nr} A ${nr} ${nr} 0 0 0 ${w} ${ny + nr}
    L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h}
    L ${r} ${h} Q 0 ${h} 0 ${h - r}
    L 0 ${ny + nr} A ${nr} ${nr} 0 0 0 0 ${ny - nr}
    L 0 ${r} Q 0 0 ${r} 0 Z
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 28 }}
      className="flex justify-center mb-5"
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
        <defs>
          <clipPath id="banner-clip">
            <path d={path} />
          </clipPath>
          {/* halftone */}
          <pattern id="banner-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="rgba(255,255,255,0.10)" />
          </pattern>
          {/* drop shadow filter */}
          <filter id="banner-shadow" x="-10%" y="-10%" width="120%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="0" flood-color="hsl(14 75% 38%)" flood-opacity="1" result="shadow" />
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="hsl(14 75% 58% / 0.22)" />
          </filter>
        </defs>

        <g filter="url(#banner-shadow)">
          {/* body */}
          <path d={path} fill="hsl(14 75% 58%)" clipPath="url(#banner-clip)" />
          {/* halftone overlay */}
          <rect width={w} height={h} fill="url(#banner-dots)" clipPath="url(#banner-clip)" />
          {/* bottom border accent */}
          <rect x={0} y={h - 4} width={w} height={4} fill="hsl(14 75% 38%)" clipPath="url(#banner-clip)" />
          {/* dashed perf line */}
          <line
            x1={nr + 6} y1={ny} x2={w - nr - 6} y2={ny}
            stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeDasharray="4,3"
          />
        </g>

        {/* label */}
        <text
          x={w / 2} y={ny - 14}
          textAnchor="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize="7.5"
          fontFamily="DM Mono, monospace"
          letterSpacing="2.5"
        >TODAY&apos;S PROMPT</text>

        {/* prompt text */}
        <foreignObject x={14} y={ny - 2} width={w - 28} height={h - ny - 2}>
          <div
            style={{
              color: "white",
              fontSize: "15px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              lineHeight: 1.2,
              textAlign: "center",
              textShadow: "0 1px 3px rgba(0,0,0,0.18)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {prompt}
          </div>
        </foreignObject>
      </svg>
    </motion.div>
  );
}

// ─── Decorative carnival arch above the camera ───────────────────────────────
function CarnivalArch() {
  return (
    <svg
      width="100%"
      viewBox="0 0 320 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", marginBottom: "-2px" }}
      aria-hidden="true"
    >
      {/* pennant triangles */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const colors = ["#D95F3B", "#E8A838", "#4A8B7F", "#D95F3B", "#E8A838", "#4A8B7F", "#D95F3B"];
        const x = i * 46 + 6;
        return (
          <polygon
            key={i}
            points={`${x},4 ${x + 40},4 ${x + 20},34`}
            fill={colors[i % colors.length]}
            opacity="0.82"
          />
        );
      })}
      {/* string */}
      <line x1="6" y1="4" x2="314" y2="4" stroke="hsl(35 18% 72%)" strokeWidth="1.5" />
      {/* string knots */}
      {[6, 52, 98, 144, 190, 236, 282, 314].map((x, i) => (
        <circle key={i} cx={x} cy="4" r="2.5" fill="hsl(35 18% 64%)" />
      ))}
    </svg>
  );
}

// ─── Film-strip frame around the camera view ─────────────────────────────────
function FilmStripFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ borderRadius: "18px", overflow: "visible" }}>
      {/* sprocket holes - left */}
      <div
        className="absolute flex flex-col justify-around py-3 z-10 pointer-events-none"
        style={{ left: "-14px", top: 0, bottom: 0, gap: 0 }}
        aria-hidden="true"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: "hsl(38 30% 96%)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)",
              margin: "2px 0",
            }}
          />
        ))}
      </div>
      {/* sprocket holes - right */}
      <div
        className="absolute flex flex-col justify-around py-3 z-10 pointer-events-none"
        style={{ right: "-14px", top: 0, bottom: 0, gap: 0 }}
        aria-hidden="true"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: "hsl(38 30% 96%)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)",
              margin: "2px 0",
            }}
          />
        ))}
      </div>

      {/* main frame */}
      <div
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          background: "hsl(25 30% 8%)",
          border: "3px solid hsl(25 30% 14%)",
          boxShadow: "0 4px 0px hsl(25 30% 6%), 0 12px 32px -4px rgba(0,0,0,0.38)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Analyzing overlay ────────────────────────────────────────────────────────
function AnalyzingOverlay({
  photoUrl,
  prompt,
  message,
}: {
  photoUrl: string;
  prompt: string;
  message: string;
}) {
  return (
    <motion.div
      key="analyzing"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex flex-col gap-4 w-full"
    >
      {/* <FilmStripFrame> */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
          <img
            src={photoUrl}
            alt="Your photo being analyzed"
            className="w-full h-full object-cover scale-105"
            style={{ filter: "blur(3px) brightness(0.55) saturate(0.7)" }}
          />

          {/* scanning line animation
          <motion.div
            className="absolute inset-x-0 h-0.5 z-10"
            style={{ background: "hsl(14 75% 58% / 0.85)", boxShadow: "0 0 12px 3px hsl(14 75% 58% / 0.5)" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          /> */}

          {/* center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 z-20">
            {/* retro ticker spinner */}
            <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.15)",
                  borderTopColor: "hsl(14 75% 62%)",
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 10,
                  borderRadius: "50%",
                  border: "2px dashed rgba(255,255,255,0.22)",
                }}
              />
              {/* center dot */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, hsl(14 75% 58%), hsl(42 85% 60%))",
                  boxShadow: "0 0 10px hsl(14 75% 58% / 0.6)",
                }}
              />
            </div>

            {/* cycling message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28 }}
                style={{
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "Nunito, sans-serif",
                  textAlign: "center",
                  textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                }}
              >
                {message}
              </motion.p>
            </AnimatePresence>

            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "10px",
                fontFamily: "DM Mono, monospace",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              checking &ldquo;{prompt}&rdquo;
            </p>
          </div>

          {/* corner crosshairs */}
          {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
            <div
              key={i}
              className={`absolute z-20 ${pos}`}
              style={{
                width: 18,
                height: 18,
                borderTop: i < 2 ? "2px solid hsl(14 75% 58% / 0.7)" : "none",
                borderBottom: i >= 2 ? "2px solid hsl(14 75% 58% / 0.7)" : "none",
                borderLeft: i % 2 === 0 ? "2px solid hsl(14 75% 58% / 0.7)" : "none",
                borderRight: i % 2 === 1 ? "2px solid hsl(14 75% 58% / 0.7)" : "none",
              }}
            />
          ))}
        </div>
      {/* </FilmStripFrame> */}

      {/* ticket-strip status label */}
      <div
        className="flex items-center justify-center gap-2 mx-auto px-5 py-2 rounded-full font-mono text-xs tracking-widest uppercase"
        style={{
          background: "hsl(38 25% 98%)",
          boxShadow: "0 2px 0 hsl(35 18% 78%), 0 4px 12px -2px rgba(0,0,0,0.08)",
          color: "hsl(25 12% 48%)",
          border: "1px solid hsl(35 18% 86%)",
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{
            display: "inline-block",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "hsl(14 75% 58%)",
          }}
        />
        AI judging in progress
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (state === "analyzing") {
      let i = 0;
      analyzingIntervalRef.current = setInterval(() => {
        i = (i + 1) % ANALYZING_MESSAGES.length;
        setAnalyzingMessage(ANALYZING_MESSAGES[i]);
      }, 1200);
    } else {
      if (analyzingIntervalRef.current) clearInterval(analyzingIntervalRef.current);
    }
    return () => {
      if (analyzingIntervalRef.current) clearInterval(analyzingIntervalRef.current);
    };
  }, [state]);

  const handleCapture = useCallback((file: File) => {
    imageFileRef.current = file;
    setPhotoUrl(URL.createObjectURL(file));
    setState("preview");
  }, []);

  const handleSubmit = useCallback(
    async (caption: string) => {
      setState("analyzing");
      setAnalyzingMessage(ANALYZING_MESSAGES[0]);
      try {
        const imageFile = imageFileRef.current;
        if (!imageFile) return;
        const [analysis, generatedAlt] = await Promise.all([
          analyzePhoto(prompt, "", imageFile),
          summarizeImage(imageFile, prompt),
        ]);
        setFeedback(analysis.feedback);
        setAltText(generatedAlt);
        if (analysis.matches) {
          const today = new Date().toISOString().split("T")[0];
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
          setState("success");
        } else {
          setState("rejected");
        }
      } catch {
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
    <main
      className="grain flex min-h-screen flex-col items-center px-6 pb-28 pt-10"
      style={{ background: "var(--gradient-bg)" }}
    >
      {/* ── Wordmark ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-1"
      >
        Impromptu
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="mb-6 text-[10px] font-mono tracking-widest text-muted-foreground/70 uppercase"
      >
        capture the photo
      </motion.div>

      {/* ── Prompt banner (only on capture/preview) ── */}
      <AnimatePresence>
        {prompt && (state === "capture" || state === "preview") && (
          <PromptBanner prompt={prompt} />
        )}
      </AnimatePresence>

      {/* ── Carnival pennant arch (capture only) ── */}
      <AnimatePresence>
        {state === "capture" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-sm"
          >
            <CarnivalArch />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">

          {/* CAPTURE */}
          {state === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              {/* <FilmStripFrame> */}
                <CameraCapture onCapture={handleCapture} />
              {/* </FilmStripFrame> */}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-4 text-center font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60"
              >
                tap to capture
              </motion.p>
            </motion.div>
          )}

          {/* PREVIEW */}
          {state === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              {/* retro label strip above the preview */}
              <div
                className="flex items-center justify-center gap-2 mb-3 mx-auto w-fit px-4 py-1.5 rounded-full font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{
                  background: "hsl(42 85% 55%)",
                  color: "hsl(25 30% 12%)",
                  boxShadow: "0 2px 0 hsl(42 85% 38%), 0 4px 10px -2px rgba(0,0,0,0.10)",
                }}
              >
                ✦ review your shot ✦
              </div>

              {/* <FilmStripFrame> */}
                <PhotoPreview
                  photoUrl={photoUrl}
                  prompt={prompt}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  submitting={false}
                />
              {/* </FilmStripFrame> */}
            </motion.div>
          )}

          {/* ANALYZING */}
          {state === "analyzing" && (
            <AnalyzingOverlay
              photoUrl={photoUrl}
              prompt={prompt}
              message={analyzingMessage}
            />
          )}

          {/* SUCCESS */}
          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              {/* winner banner */}
              <div
                className="flex items-center justify-center gap-2 mb-4 mx-auto w-fit px-5 py-2 rounded-full font-mono text-[9px] tracking-[0.22em] uppercase font-medium"
                style={{
                  background: "linear-gradient(135deg, hsl(14 75% 58%), hsl(42 85% 60%))",
                  color: "white",
                  boxShadow: "0 3px 0 hsl(14 75% 38%), 0 6px 18px -2px hsl(14 75% 58% / 0.35)",
                  textShadow: "0 1px 3px rgba(0,0,0,0.18)",
                }}
              >
                ★ photo accepted ★
              </div>
              <SubmissionSuccess
                feedback={feedback}
                photoUrl={photoUrl}
                altText={altText}
              />
            </motion.div>
          )}

          {/* REJECTED */}
          {state === "rejected" && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              {/* rejected banner */}
              <div
                className="flex items-center justify-center gap-2 mb-4 mx-auto w-fit px-5 py-2 rounded-full font-mono text-[9px] tracking-[0.22em] uppercase font-medium"
                style={{
                  background: "hsl(25 16% 13%)",
                  color: "hsl(38 25% 78%)",
                  border: "1px solid hsl(25 14% 22%)",
                  boxShadow: "0 3px 0 hsl(25 16% 7%), 0 6px 18px -4px rgba(0,0,0,0.25)",
                }}
              >
                ✗ no match — try again
              </div>
              <SubmissionRejected
                feedback={feedback}
                photoUrl={photoUrl}
                prompt={prompt}
                onRetry={handleRetry}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}