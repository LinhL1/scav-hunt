import { useState } from "react";
import { motion } from "framer-motion";
import { currentUser, friends } from "@/lib/mock-data";
import { Settings, Sparkles } from "lucide-react";
import ProfilePhotoEditor from "@/components/ProfilePhotoEditor";
import SettingsDrawer, { type Preferences } from "@/components/SettingsDrawer";

export default function Profile() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [preferences, setPreferences] = useState<Preferences>({
    darkMode: false,
    reduceMotion: false,
    soundEffects: true,
  });

  return (
    <main className="min-h-screen px-6 pb-24 pt-8">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </motion.div>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-card"
        >
          <ProfilePhotoEditor currentAvatar={avatar} onAvatarChange={setAvatar} />
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">Joined the hunt</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          {[
            { label: "Streak", value: "7" },
            { label: "Photos", value: "23" },
            { label: "Friends", value: String(friends.length) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl bg-card p-4 shadow-card"
            >
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Friends list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your friends
          </h3>
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-card"
              >
                <img
                  src={friend.avatar}
                  alt={`${friend.name}'s avatar`}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="flex-1 text-sm font-medium text-foreground">
                  {friend.name}
                </span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        preferences={preferences}
        onPreferencesChange={setPreferences}
      />
    </main>
  );
}
