import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePrompts } from "@/lib/ai/generatePrompt";
import { speakText } from "@/lib/ai/speakText";
import todayBg from "@/assets/today.png";

function isScreenReaderOn(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sh_screenReader") ?? "false");
  } catch {
    return false;
  }
}

const CARD_STYLES = [
  { bg: "#D95F3B", border: "#B84D2C", label: "#F5C4B0" },
  { bg: "#E8A838", border: "#C48820", label: "#FBE8B8" },
  { bg: "#4A8B7F", border: "#357065", label: "#B8DDD8" },
];

const DRAG_THRESHOLD = 50;
const CARD_WIDTH = 280;
const CARD_HEIGHT = 270;
const NOTCH_R = 10; // notch radius in px

/** Renders a card as an SVG so we can clip real circular holes */
function TicketCard({
  prompt,
  index,
  isActive,
}: {
  prompt: string;
  index: number;
  isActive: boolean;
}) {
  const style = CARD_STYLES[index % CARD_STYLES.length];
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;
  const r = 12; // corner radius
  const nr = NOTCH_R;
  const ny = h / 2; // notch y center
  const perfY = ny; // perforation line y

  // Build a path: rounded rect with two semicircle bites cut out
  // Left notch: bite into left edge at (0, ny)
  // Right notch: bite into right edge at (w, ny)
  const clipId = `ticket-clip-${index}`;

  const path = `
    M ${r} 0
    L ${w - r} 0
    Q ${w} 0 ${w} ${r}
    L ${w} ${ny - nr}
    A ${nr} ${nr} 0 0 0 ${w} ${ny + nr}
    L ${w} ${h - r}
    Q ${w} ${h} ${w - r} ${h}
    L ${r} ${h}
    Q 0 ${h} 0 ${h - r}
    L 0 ${ny + nr}
    A ${nr} ${nr} 0 0 0 0 ${ny - nr}
    L 0 ${r}
    Q 0 0 ${r} 0
    Z
  `;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>

      {/* Card background */}
      <rect
        width={w}
        height={h}
        rx={r}
        fill={style.bg}
        clipPath={`url(#${clipId})`}
      />

      {/* Bottom border accent */}
      <rect
        x={0}
        y={h - 4}
        width={w}
        height={4}
        rx={0}
        fill={style.border}
        clipPath={`url(#${clipId})`}
      />

      {/* Halftone dot pattern */}
      <defs>
        <pattern id={`dots-${index}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect
        width={w}
        height={h}
        fill={`url(#dots-${index})`}
        clipPath={`url(#${clipId})`}
      />

      {/* Dashed perforation line */}
      <line
        x1={nr + 8}
        y1={perfY}
        x2={w - nr - 8}
        y2={perfY}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        strokeDasharray="5,4"
      />

      {/* Prompt number label */}
      <text
        x={w / 2}
        y={perfY - 28}
        textAnchor="middle"
        fill={style.label}
        fontSize="9"
        fontFamily="DM Mono, monospace"
        letterSpacing="2"
        style={{ textTransform: "uppercase", opacity: 0.85 }}
      >
        Prompt {index + 1} of 3
      </text>

      {/* Prompt text — foreignObject for proper wrapping */}
      <foreignObject x={20} y={perfY + 16} width={w - 40} height={h - perfY - 40}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "white",
            fontSize: "26px",
            fontWeight: 900,
            fontFamily: "Nunito, sans-serif",
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          {prompt}
        </div>
      </foreignObject>

      {isActive && (
        <text
          x={w / 2}
          y={h - 14}
          textAnchor="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize="8"
          fontFamily="DM Mono, monospace"
          letterSpacing="2"
        >
          SWIPE TO BROWSE
        </text>
      )}
    </svg>
  );
}

export default function Today() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardOffset, setCardOffset] = useState(300);
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

  useEffect(() => {
    const compute = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setCardOffset(w / 2 + CARD_WIDTH / 2 - 80);
      }
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
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
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-12"
      style={{
        backgroundImage: `url(${todayBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground"
      >
        Impromptu
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 text-[10px] font-mono tracking-widest text-muted-foreground/70 uppercase"
      >
        pick a prompt
      </motion.div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">
        {/* Carousel */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
          style={{ height: CARD_HEIGHT }}
        >
          {loading ? (
            <div
              className="absolute top-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-card shadow-card border border-border"
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT, left: "50%", transform: "translateX(-50%)" }}
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="font-mono text-xs text-muted-foreground tracking-wide">loading prompts...</p>
            </div>
          ) : (
            <>
              {prompts.map((prompt, index) => {
                const offset = index - current;
                if (Math.abs(offset) > 1) return null;
                const isActive = offset === 0;
                const xPos = offset * cardOffset + (isActive ? dragX * 0.85 : dragX * 0.25);

                return (
                  <motion.div
                    key={index}
                    animate={{ x: xPos, scale: isActive ? 1 : 0.84, opacity: isActive ? 1 : 0.5 }}
                    transition={{ type: "spring", stiffness: 340, damping: 34 }}
                    drag={isActive ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDrag={(_: unknown, info: { offset: { x: number } }) => {
                      if (isActive) setDragX(info.offset.x);
                    }}
                    onDragEnd={handleDragEnd}
                    onClick={() => !isActive && goTo(index)}
                    className={`absolute top-0 select-none ${isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                    style={{
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      left: `calc(50% - ${CARD_WIDTH / 2}px)`,
                      zIndex: isActive ? 10 : 5,
                    }}
                  >
                    <TicketCard prompt={prompt} index={index} isActive={isActive} />
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
                  animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="h-1.5 rounded-full bg-foreground"
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
            whileTap={{ scale: 0.94, y: 3 }}
            onClick={handleSelect}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary border-b-4 border-[#B84D2C] shadow-soft text-white outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Take a photo for: ${prompts[current]}`}
          >
            <Camera className="h-8 w-8" />
          </motion.button>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60"
        >
          {loading ? "" : "tap to shoot"}
        </motion.p>
      </div>
    </main>
  );
}