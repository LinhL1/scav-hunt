import { motion } from "framer-motion";
import { RefreshCcw, Camera } from "lucide-react";

interface SubmissionRejectedProps {
  feedback: string;
  photoUrl: string;
  prompt: string;
  onRetry: () => void;
}

export default function SubmissionRejected({
  feedback,
  photoUrl,
  prompt,
  onRetry,
}: SubmissionRejectedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 20 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-soft"
      >
        <Camera className="h-9 w-9 text-muted-foreground" />
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-foreground">Not quite!</h2>
        <p className="text-sm text-muted-foreground">
          Your photo didn't match{" "}
          <span className="font-semibold text-foreground">"{prompt}"</span>
        </p>
      </motion.div>

      {/* Their photo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="relative h-32 w-32 overflow-hidden rounded-2xl shadow-card"
      >
        <img
          src={photoUrl}
          alt="Your submitted photo"
          className="h-full w-full object-cover opacity-60"
        />
        {/* Subtle X overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-background/80 p-2">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* AI feedback */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="max-w-xs rounded-2xl bg-secondary px-5 py-4"
      >
        <p className="text-sm italic text-secondary-foreground">{feedback}</p>
      </motion.div>

      {/* Retry button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft focus-visible:ring-2 focus-visible:ring-ring outline-none"
      >
        <RefreshCcw className="h-4 w-4" />
        Try again
      </motion.button>
    </motion.div>
  );
}