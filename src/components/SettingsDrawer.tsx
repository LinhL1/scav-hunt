import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Eye, Volume2 } from "lucide-react";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: Preferences;
  onPreferencesChange: (prefs: Preferences) => void;
}

export interface Preferences {
  darkMode: boolean;
  reduceMotion: boolean;
  soundEffects: boolean;
}

export default function SettingsDrawer({
  open,
  onOpenChange,
  preferences,
  onPreferencesChange,
}: SettingsDrawerProps) {
  const toggle = (key: keyof Preferences) => {
    onPreferencesChange({ ...preferences, [key]: !preferences[key] });
  };

  const items: { key: keyof Preferences; label: string; description: string; icon: React.ReactNode }[] = [
    {
      key: "darkMode",
      label: "Dark mode",
      description: "Switch to a darker colour scheme",
      icon: <Moon className="h-5 w-5 text-muted-foreground" />,
    },
    {
      key: "reduceMotion",
      label: "Reduce motion",
      description: "Minimise animations throughout the app",
      icon: <Eye className="h-5 w-5 text-muted-foreground" />,
    },
    {
      key: "soundEffects",
      label: "Sound effects",
      description: "Play sounds for interactions",
      icon: <Volume2 className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-bold text-foreground">Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {items.map((item) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                {item.icon}
              </div>
              <div className="flex-1">
                <Label htmlFor={item.key} className="text-sm font-semibold text-foreground">
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                id={item.key}
                checked={preferences[item.key]}
                onCheckedChange={() => toggle(item.key)}
                aria-label={item.label}
              />
            </motion.div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
