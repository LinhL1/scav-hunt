import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePrompt } from "@/lib/ai/generatePrompt";
import { speakText } from "@/lib/ai/speakText";
import PromptCard from "@/components/PromptCard";

function isScreenReaderOn(): boolean {
  try {
    return JSON.parse(localStorage.getItem("sh_screenReader") ?? "false");
  } catch {
    return false;
  }
}

export default function Today() {
  const navigate = useNavigate();

  useEffect(() => {
    generatePrompt().then((p) => {
      setPrompt(p);
      setLoading(false);

      // Speak the prompt aloud if screen reader is enabled
      if (isScreenReaderOn() && p) {
        speakText(`Today's photo prompt is: ${p}. Tap the camera button to capture your moment.`);
      }
    });
  }

  // Path configuration
  const LEFT_X = 30;
  const RIGHT_X = 270;
  const LEVELS = [80, 170, 260, 350, 440, 530, 620, 710, 800, 890];
  const CURVE_RADIUS = 45;

  // Generate path and sample points at the same time
  const { pathString, pathPoints } = useMemo(() => {
    const segments = [];
    const points = [];
    
    // Helper to add a point
    const addPoint = (x, y) => points.push({ x, y });
    
    // Cubic bezier sampler
    const sampleBezier = (x0, y0, x1, y1, x2, y2, x3, y3, numSamples, clampX = null) => {
      for (let i = 1; i <= numSamples; i++) {
        const t = i / numSamples;
        const u = 1 - t;
        let x = u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3;
        const y = u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3;
        
        // Clamp X if needed
        if (clampX) {
          x = Math.max(clampX.min, Math.min(clampX.max, x));
        }
        
        addPoint(x, y);
      }
    };
    
    // Start point
    addPoint(RIGHT_X, LEVELS[0]);
    segments.push(`M ${RIGHT_X} ${LEVELS[0]}`);
    
    let onRight = true;
    
    for (let i = 0; i < LEVELS.length - 1; i++) {
      const currentY = LEVELS[i];
      const nextY = LEVELS[i + 1];
      const midY = (currentY + nextY) / 2;
      
      if (onRight) {
        // Horizontal line - sample points
        const startX = RIGHT_X;
        const endX = LEFT_X + CURVE_RADIUS;
        const numPoints = 20;
        for (let j = 1; j <= numPoints; j++) {
          const t = j / numPoints;
          addPoint(startX + (endX - startX) * t, currentY);
        }
        segments.push(`L ${endX} ${currentY}`);
        
        // First curve
        sampleBezier(
          LEFT_X + CURVE_RADIUS, currentY,
          LEFT_X, currentY,
          LEFT_X, currentY + CURVE_RADIUS,
          LEFT_X, midY,
          15,
          { min: LEFT_X, max: RIGHT_X }
        );
        segments.push(`C ${LEFT_X} ${currentY}, ${LEFT_X} ${currentY + CURVE_RADIUS}, ${LEFT_X} ${midY}`);
        
        // Second curve
        sampleBezier(
          LEFT_X, midY,
          LEFT_X, nextY - CURVE_RADIUS,
          LEFT_X, nextY,
          LEFT_X + CURVE_RADIUS, nextY,
          15,
          { min: LEFT_X, max: RIGHT_X }
        );
        segments.push(`C ${LEFT_X} ${nextY - CURVE_RADIUS}, ${LEFT_X} ${nextY}, ${LEFT_X + CURVE_RADIUS} ${nextY}`);
      } else {
        // Horizontal line - sample points
        const startX = LEFT_X;
        const endX = RIGHT_X - CURVE_RADIUS;
        const numPoints = 20;
        for (let j = 1; j <= numPoints; j++) {
          const t = j / numPoints;
          addPoint(startX + (endX - startX) * t, currentY);
        }
        segments.push(`L ${endX} ${currentY}`);
        
        // First curve
        sampleBezier(
          RIGHT_X - CURVE_RADIUS, currentY,
          RIGHT_X, currentY,
          RIGHT_X, currentY + CURVE_RADIUS,
          RIGHT_X, midY,
          15,
          { min: LEFT_X, max: RIGHT_X }
        );
        segments.push(`C ${RIGHT_X} ${currentY}, ${RIGHT_X} ${currentY + CURVE_RADIUS}, ${RIGHT_X} ${midY}`);
        
        // Second curve
        sampleBezier(
          RIGHT_X, midY,
          RIGHT_X, nextY - CURVE_RADIUS,
          RIGHT_X, nextY,
          RIGHT_X - CURVE_RADIUS, nextY,
          15,
          { min: LEFT_X, max: RIGHT_X }
        );
        segments.push(`C ${RIGHT_X} ${nextY - CURVE_RADIUS}, ${RIGHT_X} ${nextY}, ${RIGHT_X - CURVE_RADIUS} ${nextY}`);
      }
      
      onRight = !onRight;
    }
    
    return {
      pathString: segments.join(' '),
      pathPoints: points
    };
  }, []);

  // Get marker position by index - just pick from sampled points
  const getMarkerPosition = (index) => {
    const totalMarkers = dates.length;
    const pointIndex = Math.floor((index / (totalMarkers - 1)) * (pathPoints.length - 1));
    return pathPoints[pointIndex] || pathPoints[0];
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a] z-10 px-6 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold leading-tight"
        >
          Hi, {userName}! Click on today's date to join the hunt.
        </motion.h1>
      </div>

      {/* Map Container */}
      <div className="relative px-6 pb-32" style={{ minHeight: '1000px' }}>
        <svg 
          className="absolute left-0 w-full" 
          style={{ height: '1000px' }}
          viewBox="0 0 300 1000"
          preserveAspectRatio="xMidYMin meet"
        >
          <motion.path
            d={pathString}
            stroke="#4ade80"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>

        {/* Date markers */}
        <div className="relative" style={{ height: '1000px' }}>
          {dates.map((item, index) => {
            const pos = getMarkerPosition(index);
            const xPercent = (pos.x / 300) * 100;
            const yPercent = (pos.y / 1000) * 100;

            return (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="absolute"
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {item.isToday ? (
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleTodayClick}
                      className="relative z-10 cursor-pointer bg-transparent border-none p-0"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MapPin className="h-12 w-12 text-red-500 fill-red-500" />
                      </motion.div>
                    </button>
                    <span className="mt-2 text-sm font-semibold">{item.date}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white relative z-10 shadow-lg" />
                    {index % 5 === 0 && index !== 0 && (
                      <span className="mt-1 text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800">
        <div className="flex items-center justify-around px-6 py-4">
          <button className="flex flex-col items-center gap-1">
            <MapPin className="h-6 w-6" />
            <span className="text-xs">Map</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <div className="h-6 w-6 flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              </div>
            </div>
            <span className="text-xs">Feed</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </main>
  );
}