import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type Submission } from "@/lib/mock-data";
import { speakText, stopSpeaking } from "@/lib/ai/speakText";
import FriendPost from "@/components/FriendPost";
import { subscribeFeed } from "@/lib/feed";

function isScreenReaderOn(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sh_screenReader") ?? "false");
  } catch {
    return false;
  }
}

export default function Friends() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Firebase in real-time
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const unsubscribe = subscribeFeed(today, (subs) => {
      setSubmissions(subs);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Announce the page when screen reader is on
  useEffect(() => {
    if (!isScreenReaderOn() || loading) return;
    speakText(
      `Friends feed. ${submissions.length} photo${submissions.length !== 1 ? "s" : ""} from your friends today.`
    );
    return () => stopSpeaking();
  }, [submissions.length, loading]);

  return (
    <main className="min-h-screen px-4 pb-24 pt-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-foreground"
      >
        Friends
      </motion.h1>

      <div className="mx-auto flex max-w-lg flex-col gap-5">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : submissions.length === 0 ? (
          <p className="text-center text-muted-foreground">No photos yet today!</p>
        ) : (
          submissions.map((sub, i) => (
            <FriendPost key={sub.id} submission={sub} index={i} />
          ))
        )}
      </div>
    </main>
  );
}