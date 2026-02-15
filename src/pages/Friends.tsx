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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const unsubscribe = subscribeFeed(today, (subs) => {
      setSubmissions(subs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isScreenReaderOn() || loading) return;
    speakText(
      `Friends feed. ${submissions.length} photo${submissions.length !== 1 ? "s" : ""} from your friends today.`
    );
    return () => stopSpeaking();
  }, [submissions.length, loading]);

  return (
    <main className="min-h-screen pb-24 pt-6">

      {/* Retro header banner */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-[#D95F3B] border-b-4 border-[#B84D2C] px-5 py-4"
        >
          {/* Halftone dot overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#F5C4B0] mb-0.5">
                Today's roll
              </p>
              <h1 className="text-2xl font-black text-white leading-none tracking-tight">
                Friends Feed
              </h1>
            </div>
            {!loading && (
              <div className="flex flex-col items-end">
                <span className="font-mono text-[10px] text-[#F5C4B0] uppercase tracking-widest">
                  shots
                </span>
                <span className="text-3xl font-black text-white leading-none">
                  {submissions.length}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Divider — retro ticket stub style */}
      <div className="relative px-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 border-t-2 border-dashed border-border" />
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-muted-foreground/50">
            scroll to browse
          </span>
          <div className="h-px flex-1 border-t-2 border-dashed border-border" />
        </div>
      </div>

      {/* Feed */}
      <div className="mx-auto flex max-w-lg flex-col gap-4 px-4">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16"
          >
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground/60">
              developing film...
            </p>
          </motion.div>
        ) : submissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            {/* Empty state — retro camera icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border-b-4 border-border">
              <svg className="h-9 w-9 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-black text-foreground text-lg">No shots yet!</p>
              <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60 mt-1">
                be the first to shoot today
              </p>
            </div>
          </motion.div>
        ) : (
          submissions.map((sub, i) => (
            <FriendPost key={sub.id} submission={sub} index={i} />
          ))
        )}
      </div>
    </main>
  );
}