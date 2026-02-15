import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellOff,
  ChevronRight,
  Contrast,
  Eye,
  EyeOff,
  Info,
  LogOut,
  Mic,
  Moon,
  Shield,
  Sun,
  Trash2,
  Type,
  Volume2,
  VolumeX,
  ZapOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FontSize = "Small" | "Medium" | "Large" | "X-Large";

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function savePref<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3.5 shadow-card text-left focus-visible:ring-2 focus-visible:ring-ring outline-none"
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
          value ? "bg-primary" : "bg-muted"
        }`}
      >
        <span className={value ? "text-primary-foreground" : "text-muted-foreground"}>
          {icon}
        </span>
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground truncate">{description}</span>
        )}
      </div>

      {/* Pill toggle */}
      <div
        className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 ${
          value ? "bg-primary" : "bg-muted"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="absolute h-5 w-5 rounded-full bg-white shadow-sm"
          style={{ left: value ? "calc(100% - 1.35rem)" : "0.1rem" }}
        />
      </div>
    </button>
  );
}

function ActionRow({
  icon,
  label,
  description,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3.5 shadow-card text-left focus-visible:ring-2 focus-visible:ring-ring outline-none"
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
          destructive ? "bg-red-100 text-red-500" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <span
          className={`text-sm font-medium ${
            destructive ? "text-red-500" : "text-foreground"
          }`}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground truncate">{description}</span>
        )}
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </button>
  );
}

function Section({ title, children, delay = 0 }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mt-6"
    >
      <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </motion.div>
  );
}

// ─── Font size selector ───────────────────────────────────────────────────────

const FONT_SIZES: FontSize[] = ["Small", "Medium", "Large", "X-Large"];
const FONT_SIZE_MAP: Record<FontSize, string> = {
  Small: "14px",
  Medium: "16px",
  Large: "18px",
  "X-Large": "20px",
};

function FontSizeRow({
  value,
  onChange,
}: {
  value: FontSize;
  onChange: (v: FontSize) => void;
}) {
  return (
    <div className="rounded-xl bg-card px-4 py-3.5 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
          <Type className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Font Size</span>
          <span className="text-xs text-muted-foreground">Adjust text readability</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {FONT_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`rounded-lg py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none ${
              value === size
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [darkMode,       setDarkMode]       = useState(() => loadPref("sh_darkMode", false));
  const [highContrast,   setHighContrast]   = useState(() => loadPref("sh_highContrast", false));
  const [reduceMotion,   setReduceMotion]   = useState(() => loadPref("sh_reduceMotion", false));
  const [screenReader,   setScreenReader]   = useState(() => loadPref("sh_screenReader", false));
  const [fontSize,       setFontSize]       = useState<FontSize>(() => loadPref<FontSize>("sh_fontSize", "Medium"));
  const [hidePhotos,     setHidePhotos]     = useState(() => loadPref("sh_hidePhotos", false));
  const [soundEffects,   setSoundEffects]   = useState(() => loadPref("sh_soundEffects", true));
  const [dailyReminder,  setDailyReminder]  = useState(() => loadPref("sh_dailyReminder", true));
  const [friendActivity, setFriendActivity] = useState(() => loadPref("sh_friendActivity", true));
  const [dataSaver,      setDataSaver]      = useState(() => loadPref("sh_dataSaver", false));

  // ── Dark mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    savePref("sh_darkMode", darkMode);
  }, [darkMode]);

  // ── High contrast ──────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    savePref("sh_highContrast", highContrast);
  }, [highContrast]);

  // ── Reduce motion ──────────────────────────────────────────────────────────
  useEffect(() => {
    const id = "sh-reduce-motion";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (reduceMotion) {
      if (!el) {
        el = document.createElement("style");
        el.id = id;
        document.head.appendChild(el);
      }
      el.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
    } else {
      el?.remove();
    }
    savePref("sh_reduceMotion", reduceMotion);
  }, [reduceMotion]);

  // ── Font size ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = "sh-font-size";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `:root { font-size: ${FONT_SIZE_MAP[fontSize]}; }`;
    savePref("sh_fontSize", fontSize);
  }, [fontSize]);

  // ── Persist remaining prefs ────────────────────────────────────────────────
  useEffect(() => { savePref("sh_screenReader",   screenReader);   }, [screenReader]);
  useEffect(() => { savePref("sh_hidePhotos",     hidePhotos);     }, [hidePhotos]);
  useEffect(() => { savePref("sh_soundEffects",   soundEffects);   }, [soundEffects]);
  useEffect(() => { savePref("sh_dailyReminder",  dailyReminder);  }, [dailyReminder]);
  useEffect(() => { savePref("sh_friendActivity", friendActivity); }, [friendActivity]);
  useEffect(() => { savePref("sh_dataSaver",      dataSaver);      }, [dataSaver]);

  return (
    <main className="min-h-screen px-6 pb-24 pt-8">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </motion.div>

        {/* ── Appearance ── */}
        <Section title="Appearance" delay={0.1}>
          <ToggleRow
            icon={darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            label="Dark Mode"
            description="Switch to a darker colour scheme"
            value={darkMode}
            onChange={setDarkMode}
          />
          {/* <ToggleRow
            icon={<Contrast className="h-4 w-4" />}
            label="High Contrast"
            description="Increase contrast for better visibility"
            value={highContrast}
            onChange={setHighContrast}
          /> */}
        </Section>

        {/* ── Accessibility ── */}
        <Section title="Accessibility" delay={0.15}>
          <ToggleRow
            icon={<Mic className="h-4 w-4" />}
            label="Screen Reader"
            description="Read prompts and UI aloud via TTS"
            value={screenReader}
            onChange={setScreenReader}
          />

          <AnimatePresence>
            {screenReader && (
              <motion.div
                key="reader-note"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-xl bg-primary/10 px-4 py-3 text-xs text-primary">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    Screen reader is active. Prompts, buttons, and friend names will be
                    announced automatically using your device's TTS engine.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <FontSizeRow value={fontSize} onChange={setFontSize} />

          {/* <ToggleRow
            icon={hidePhotos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            label="Hide Friend Photos"
            description="Show initials instead of profile pictures"
            value={hidePhotos}
            onChange={setHidePhotos}
          />
          <ToggleRow
            icon={<ZapOff className="h-4 w-4" />}
            label="Reduce Motion"
            description="Minimise animations and transitions"
            value={reduceMotion}
            onChange={setReduceMotion}
          /> */}
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications" delay={0.2}>
          <ToggleRow
            icon={dailyReminder ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            label="Daily Reminder"
            description="Get reminded to submit today's photo"
            value={dailyReminder}
            onChange={setDailyReminder}
          />
          <ToggleRow
            icon={<Bell className="h-4 w-4" />}
            label="Friend Activity"
            description="Know when friends post their shots"
            value={friendActivity}
            onChange={setFriendActivity}
          />
        </Section>

        {/* ── Sound ── */}
        <Section title="Sound" delay={0.25}>
          <ToggleRow
            icon={soundEffects ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            label="Sound Effects"
            description="Shutter click, success chime, etc."
            value={soundEffects}
            onChange={setSoundEffects}
          />
        </Section>


        {/* ── Privacy & Account ── */}
        <Section title="Privacy & Account" delay={0.35}>
          <ActionRow
            icon={<Shield className="h-4 w-4" />}
            label="Privacy Policy"
            description="How we handle your data"
          />
          {/* <ActionRow
            icon={<Trash2 className="h-4 w-4" />}
            label="Clear Cache"
            description="Free up local storage"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          /> */}
          <ActionRow
            icon={<LogOut className="h-4 w-4" />}
            label="Sign Out"
            destructive
          />
        </Section>

        {/* Version stamp */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          Scavenger Hunt · v1.0.0
        </motion.p>
      </div>
    </main>
  );
}