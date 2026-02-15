import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { currentUser, friends } from "@/lib/mock-data";
import ProfilePhotoEditor from "@/components/ProfilePhotoEditor";

interface SubmissionRecord {
  id: string;
  photoUrl: string;
  altText: string;
  createdAt: Date;
}

function calcStreak(submissions: SubmissionRecord[]): number {
  if (submissions.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const submissionDays = new Set(
    submissions.map((s) => {
      const d = new Date(s.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  const DAY_MS = 1000 * 60 * 60 * 24;
  let streak = 0;
  let checkDay = today.getTime();
  while (submissionDays.has(checkDay)) {
    streak++;
    checkDay -= DAY_MS;
  }
  return streak;
}

export default function Profile() {
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "submissions"),
          where("userId", "==", currentUser.id)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              photoUrl: data.photoUrl ?? "",
              altText: data.altText ?? "",
              createdAt:
                data.createdAt instanceof Timestamp
                  ? data.createdAt.toDate()
                  : new Date(data.createdAt),
            };
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setSubmissions(docs);
      } catch (err) {
        console.error("Failed to load submissions from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    window.addEventListener("sh:submission_added", loadStats);
    return () => window.removeEventListener("sh:submission_added", loadStats);
  }, []);

  const totalPhotos = submissions.length;
  const streak = calcStreak(submissions);

  const stats = [
    { label: "Streak", value: loading ? "—" : streak > 0 ? `${streak}🔥` : "0", title: `${streak} day streak`, color: "#D95F3B", border: "#B84D2C" },
    { label: "Photos", value: loading ? "—" : String(totalPhotos), title: `${totalPhotos} photos submitted`, color: "#E8A838", border: "#C48820" },
    { label: "Friends", value: String(friends.length), title: `${friends.length} friends`, color: "#4A8B7F", border: "#357065" },
  ];

  return (
    <main className="min-h-screen pb-24 pt-6">
      <div className="mx-auto max-w-sm px-4">

        {/* Header banner — retro tomato style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-[#4A8B7F] border-b-4 border-[#357065] px-5 py-4 mb-6"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#B8DDD8] mb-0.5">
                your record
              </p>
              <h1 className="text-2xl font-black text-white leading-none tracking-tight">
                Stats
              </h1>
            </div>
            <button
              onClick={() => navigate("/settings")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white focus-visible:ring-2 focus-visible:ring-white outline-none"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-4 rounded-xl bg-card border-b-4 border-border p-6 shadow-card mb-4"
        >
          <ProfilePhotoEditor currentAvatar={avatar} onAvatarChange={setAvatar} />
          <div className="text-center">
            <h2 className="text-lg font-black text-foreground">{currentUser.name}</h2>
            <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60 mt-0.5">
              joined the hunt
            </p>
          </div>
        </motion.div>

        {/* Stats — retro ticket stubs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              title={stat.title}
              className="relative overflow-hidden flex flex-col items-center rounded-xl px-3 py-4 border-b-4"
              style={{ backgroundColor: stat.color, borderColor: stat.border }}
            >
              {/* Halftone */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />
              <span className="relative z-10 text-2xl font-black text-white leading-none">{stat.value}</span>
              <span className="relative z-10 font-mono text-[9px] tracking-[0.15em] uppercase text-white/70 mt-1">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Dashed divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 border-t-2 border-dashed border-border" />
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-muted-foreground/40">your shots</span>
          <div className="h-px flex-1 border-t-2 border-dashed border-border" />
        </div>

        {/* Recent submissions grid */}
        {!loading && totalPhotos > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <div className="grid grid-cols-3 gap-2">
              {submissions.slice(0, 6).map((sub) => (
                <div
                  key={sub.id}
                  className="aspect-square overflow-hidden rounded-xl border-b-4 border-border shadow-card"
                >
                  <img
                    src={sub.photoUrl}
                    alt={sub.altText}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && totalPhotos === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 py-8 mb-6"
          >
            <p className="font-black text-foreground">No shots yet!</p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50">
              go capture something
            </p>
          </motion.div>
        )}

        {/* Dashed divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 border-t-2 border-dashed border-border" />
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-muted-foreground/40">the crew</span>
          <div className="h-px flex-1 border-t-2 border-dashed border-border" />
        </div>

        {/* Friends list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 rounded-xl bg-card border-b-4 border-border px-4 py-3 shadow-card"
            >
              <img
                src={friend.avatar}
                alt={`${friend.name}'s avatar`}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
              />
              <span className="flex-1 text-sm font-black text-foreground">{friend.name}</span>
              <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/50">
                crew
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </main>
  );
}