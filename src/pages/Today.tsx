import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePrompt } from "@/lib/ai/generatePrompt";
import { speakText } from "@/lib/ai/speakText";
import PromptCard from "@/components/PromptCard";

function isScreenReaderOn(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sh_screenReader") ?? "false");
  } catch {
    return false;
  }
}

export default function Today() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    generatePrompt().then((p) => {
      setPrompt(p);
      setLoading(false);

      // Speak the prompt aloud if screen reader is enabled
      if (isScreenReaderOn() && p) {
        speakText(`Today's photo prompt is: ${p}. Tap the camera button to capture your moment.`);
      }
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 text-sm font-semibold tracking-widest uppercase text-primary"
      >
        SH
      </motion.div>

      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <PromptCard prompt={prompt} loading={loading} />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate("/camera")}
          className="flex h-20 w-20 items-center justify-center rounded-full gradient-warm shadow-soft text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
          aria-label="Take a photo for today's prompt"
        >
          <Camera className="h-8 w-8" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground"
        >
          Tap to capture your moment
        </motion.p>
      </div>
    </main>
  );
}