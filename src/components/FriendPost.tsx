import { motion } from "framer-motion";
import { Submission, getUserById } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface FriendPostProps {
  submission: Submission;
  index: number;
}

export default function FriendPost({ submission, index }: FriendPostProps) {
  const user = getUserById(submission.userId);
  if (!user) return null;

  // Convert Firebase Timestamp to Date
  const createdAt = submission.createdAt instanceof Timestamp 
    ? submission.createdAt.toDate() 
    : new Date(submission.createdAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 30 }}
      className="overflow-hidden rounded-2xl bg-card shadow-card"
      aria-label={`Photo by ${user.name}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <img
          src={user.avatar}
          alt={`${user.name}'s avatar`}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {submission.promptText || submission.prompt}
        </span>
      </div>

      {/* Photo */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={submission.photoUrl}
          alt={submission.altText}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 space-y-2">
        {submission.caption && (
          <p className="text-sm text-foreground">{submission.caption}</p>
        )}
        <p className="text-sm text-accent italic">
          {submission.aiFeedback}
        </p>
      </div>
    </motion.article>
  );
}