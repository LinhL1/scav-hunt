import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";

interface PhotoPreviewProps {
  photoUrl: string;
  prompt: string;
  onSubmit: (caption: string) => void;
  onBack: () => void;
  submitting?: boolean;
}

export default function PhotoPreview({
  photoUrl,
  prompt,
  onSubmit,
  onBack,
  submitting,
}: PhotoPreviewProps) {
  const [caption, setCaption] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col gap-4"
    >
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          Responding to <span className="font-bold text-foreground">{prompt}</span>
        </span>
      </div>

      {/* Photo */}
      <motion.div
        className="overflow-hidden rounded-2xl shadow-elevated"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <img
          src={photoUrl}
          alt="Your photo preview"
          className="aspect-square w-full object-cover"
        />
      </motion.div>

      {/* Caption */}
      <input
        type="text"
        placeholder="Add a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={100}
        className="rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Photo caption"
      />

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSubmit(caption)}
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring outline-none"
        aria-label="Share your photo"
      >
        {submitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            Share
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
