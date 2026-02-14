import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const CARD_COLORS = [
  "from-orange-400/20 to-amber-300/10",
  "from-rose-400/20 to-pink-300/10",
  "from-teal-400/20 to-emerald-300/10",
];

const CARD_ACCENTS = [
  "text-orange-500 dark:text-orange-400",
  "text-rose-500 dark:text-rose-400",
  "text-teal-500 dark:text-teal-400",
];

const DRAG_THRESHOLD = 60;

export default function Today() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const navigate = useNavigate();

  useEffect(() => {
    generatePrompts().then((p) => {
      setPrompts(p);
      setLoading(false);
      if (isScreenReaderOn()) {
        speakText(`Today you have ${p.length} prompts to choose from. ${p.map((pr, i) => `Option ${i + 1}: ${pr}`).join(". ")}.`);
      }
    });
  }, []);

  const goTo = (index: number) => {
    if (index === current) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -DRAG_THRESHOLD && current < prompts.length - 1) {
      goTo(current + 1);
    } else if (info.offset.x > DRAG_THRESHOLD && current > 0) {
      goTo(current - 1);
    }
  };

  const handleSelect = () => {
    if (!prompts[current]) return;
    // Store selected prompt so CameraPage picks it up
    sessionStorage.setItem("sh_selected_prompt", prompts[current]);
    navigate("/camera");
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 280 : -280, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -280 : 280, opacity: 0, scale: 0.92 }),
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

        {/* Carousel */}
        <div className="relative w-full max-w-sm overflow-hidden" style={{ height: 220 }}>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-card shadow-card"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Finding today's prompts...</p>
            </motion.div>
          ) : (
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={handleDragEnd}
                className={`absolute inset-0 flex cursor-grab flex-col items-center justify-center gap-5 rounded-3xl bg-gradient-to-br ${CARD_COLORS[current % CARD_COLORS.length]} bg-card px-8 shadow-card select-none active:cursor-grabbing`}
                style={{ background: undefined }}
              >
                {/* Card background */}
                <div className={`absolute inset-0 rounded-3xl bg-card`} />
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${CARD_COLORS[current % CARD_COLORS.length]} opacity-60`} />

                {/* Prompt number */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${CARD_ACCENTS[current % CARD_ACCENTS.length]}`}>
                    Prompt {current + 1} of {prompts.length}
                  </span>

                  <h2 className="text-center text-3xl font-bold text-foreground leading-tight">
                    {prompts[current]}
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    Swipe to see more
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
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
                className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <motion.div
                  animate={{
                    width: i === current ? 24 : 8,
                    opacity: i === current ? 1 : 0.35,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="h-2 rounded-full bg-primary"
                />
              </button>
            ))}
          </motion.div>
        )}

        {/* Select & shoot button */}
        {!loading && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSelect}
            className="flex h-20 w-20 items-center justify-center rounded-full gradient-warm shadow-soft text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
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