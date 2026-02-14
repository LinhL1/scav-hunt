import { useRef } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

interface ProfilePhotoEditorProps {
  currentAvatar: string;
  onAvatarChange: (url: string) => void;
}

export default function ProfilePhotoEditor({ currentAvatar, onAvatarChange }: ProfilePhotoEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAvatarChange(url);
  };

  return (
    <div className="relative inline-block">
      <img
        src={currentAvatar}
        alt="Your profile photo"
        className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20"
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => fileRef.current?.click()}
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Change profile photo"
      >
        <Camera className="h-4 w-4" />
      </motion.button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        aria-hidden="true"
      />
    </div>
  );
}
