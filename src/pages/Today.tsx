import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePrompts } from "@/lib/ai/generatePrompt";
import { speakText } from "@/lib/ai/speakText";

function isScreenReaderOn(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sh_screenReader") ?? "false");
  } catch {
    return false;
  }
}

const CARD_COLORS = ["bg-orange-400", "bg-rose-400", "bg-teal-400"];
const CARD_ACCENTS = ["text-orange-100", "text-rose-100", "text-teal-100"];
const DRAG_THRESHOLD = 50;

// Fixed card dimensions
const CARD_WIDTH = 280;
const CARD_HEIGHT = 260;
// How far side cards are offset from center
const CARD_OFFSET = 200;

export default function Today() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    generatePrompts().then((p) => {
      setPrompts(p);
      setLoading(false);
      if (isScreenReaderOn()) {
        speakText(
          `Today you have ${p.length} prompts to choose from. ${p
            .map((pr, i) => `Option ${i + 1}: ${pr}`)
            .join(". ")}.`
        );
      }
    });
  }, []);

  const goTo = (index: number) => {
    if (index < 0 || index >= prompts.length || index === current) return;
    setCurrent(index);
    setDragX(0);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -DRAG_THRESHOLD) goTo(current + 1);
    else if (info.offset.x > DRAG_THRESHOLD) goTo(current - 1);
    setDragX(0);
  };

  const handleSelect = () => {
    if (!prompts[current]) return;
    sessionStorage.setItem("sh_selected_prompt", prompts[current]);
    navigate("/camera");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-12">
      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-sm font-semibold tracking-widest uppercase text-primary"
      >
        SH
      </motion.div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">

        {/* 
          Carousel wrapper:
          - overflow-hidden clips side cards so they don't extend the page
          - Cards are positioned absolutely relative to the center using translateX
        */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: CARD_HEIGHT }}
        >
          {loading ? (
            <div
              className="absolute top-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-card shadow-card"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Finding today's prompts...</p>
            </div>
          ) : (
            <>
              {prompts.map((prompt, index) => {
                const offset = index - current;
                if (Math.abs(offset) > 1) return null;

                const isActive = offset === 0;

                // x position: center of screen + offset + drag influence
                const xPos = offset * CARD_OFFSET + (isActive ? dragX * 0.85 : dragX * 0.25);

                return (
                  <motion.div
                    key={index}
                    animate={{
                      x: xPos,
                      scale: isActive ? 1 : 0.84,
                      opacity: isActive ? 1 : 0.55,
                    }}
                    transition={{ type: "spring", stiffness: 340, damping: 34 }}
                    drag={isActive ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDrag={(_: unknown, info: { offset: { x: number } }) => {
                      if (isActive) setDragX(info.offset.x);
                    }}
                    onDragEnd={handleDragEnd}
                    onClick={() => !isActive && goTo(index)}
                    className={`absolute top-0 flex flex-col items-center justify-center gap-4 rounded-2xl ${
                      CARD_COLORS[index % CARD_COLORS.length]
                    } shadow-elevated select-none ${
                      isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                    }`}
                    style={{
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      // Center the card horizontally
                      left: `calc(50% - ${CARD_WIDTH / 2}px)`,
                      zIndex: isActive ? 10 : 5,
                    }}
                  >
                    {/* Dashed perforation line */}
                    <div className="absolute left-5 right-5 top-1/2 border-t-2 border-dashed border-white/30" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-2 px-6">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${
                          CARD_ACCENTS[index % CARD_ACCENTS.length]
                        } opacity-80`}
                      >
                        Prompt {index + 1} of {prompts.length}
                      </span>
                      <h2 className="text-center text-3xl font-bold text-white leading-tight drop-shadow-sm">
                        {prompt}
                      </h2>
                      {isActive && (
                        <p className="mt-1 text-xs text-white/60">Swipe to see more</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>

        {/* Dot indicators */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2"
          >
            {prompts.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to prompt ${i + 1}`}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <motion.div
                  animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.35 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="h-2 rounded-full bg-primary"
                />
              </button>
            ))}
          </motion.div>
        )}

        {/* Camera button */}
        {!loading && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSelect}
            className="flex h-20 w-20 items-center justify-center rounded-full gradient-warm shadow-soft text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Take a photo for: ${prompts[current]}`}
          >
            <Camera className="h-8 w-8" />
          </motion.button>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground"
        >
          {loading ? "" : "Tap to capture your moment"}
        </motion.p>
      </div>
    </main>
  );
}