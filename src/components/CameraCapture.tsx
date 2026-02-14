import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, X, SwitchCamera } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState(false);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    setCameraError(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOpen(true);
    } catch {
      setCameraError(true);
      setCameraOpen(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCameraClick = useCallback(() => {
    if (isMobile) {
      // On mobile, use native file input with capture
      nativeInputRef.current?.click();
    } else {
      startCamera(facingMode);
    }
  }, [isMobile, startCamera, facingMode]);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          stopCamera();
          onCapture(file);
        }
      },
      "image/jpeg",
      0.92
    );
  }, [onCapture, stopCamera]);

  const flipCamera = useCallback(() => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {cameraOpen ? (
          <motion.div
            key="viewfinder"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-elevated"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-square w-full object-cover"
              aria-label="Camera viewfinder"
            />

            {/* Camera controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 bg-gradient-to-t from-foreground/60 to-transparent px-6 pb-5 pt-12">
              <button
                onClick={stopCamera}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close camera"
              >
                <X className="h-5 w-5" />
              </button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={takePhoto}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary-foreground bg-primary-foreground/20 backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Take photo"
              >
                <div className="h-12 w-12 rounded-full bg-primary-foreground" />
              </motion.button>

              <button
                onClick={flipCamera}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Switch camera"
              >
                <SwitchCamera className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-6"
          >
            {cameraError && (
              <p className="text-sm text-destructive text-center max-w-xs">
                Camera access was denied. Please allow camera access in your browser settings, or upload a photo instead.
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCameraClick}
              className="flex h-28 w-28 items-center justify-center rounded-full gradient-warm shadow-soft text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
              aria-label="Take a photo"
            >
              <Camera className="h-10 w-10" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
              aria-label="Upload a photo from your device"
            >
              <ImagePlus className="h-4 w-4" />
              Upload from gallery
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Native camera input for mobile */}
      <input
        ref={nativeInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
        aria-hidden="true"
      />
      {/* Gallery file input */}
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
