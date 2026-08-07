"use client";

import { motion } from "framer-motion";

interface TeddyMascotProps {
  /** Size in px (default 120) */
  size?: number;
  /** Optional className */
  className?: string;
  /** Mood: happy | sad (default happy) */
  mood?: "happy" | "sad";
}

export function TeddyMascot({
  size = 120,
  className = "",
  mood = "happy",
}: TeddyMascotProps) {
  const s = size;
  const earSize = s * 0.3;
  const headSize = s * 0.55;
  const eyeSize = s * 0.06;
  const noseSize = s * 0.04;
  const faceY = s * 0.55;

  return (
    <motion.div
      className={`${className} select-none`}
      style={{ width: s, height: s }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Ear */}
        <circle cx={s * 0.28} cy={s * 0.22} r={earSize} fill="#d4a017" />
        <circle cx={s * 0.28} cy={s * 0.22} r={earSize * 0.6} fill="#fef6ed" />
        
        {/* Right Ear */}
        <circle cx={s * 0.72} cy={s * 0.22} r={earSize} fill="#d4a017" />
        <circle cx={s * 0.72} cy={s * 0.22} r={earSize * 0.6} fill="#fef6ed" />

        {/* Head */}
        <ellipse cx={s * 0.5} cy={faceY} rx={headSize} ry={headSize * 0.85} fill="#f5cba7" />

        {/* Eyes */}
        <motion.circle
          cx={s * 0.38} cy={s * 0.5} r={eyeSize} fill="#0a0a0a"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
        <motion.circle
          cx={s * 0.62} cy={s * 0.5} r={eyeSize} fill="#0a0a0a"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />

        {/* Eye shine */}
        <circle cx={s * 0.36} cy={s * 0.48} r={eyeSize * 0.35} fill="white" />
        <circle cx={s * 0.6} cy={s * 0.48} r={eyeSize * 0.35} fill="white" />

        {/* Nose */}
        <ellipse cx={s * 0.5} cy={s * 0.58} rx={noseSize} ry={noseSize * 0.7} fill="#e11d48" />

        {/* Mouth */}
        {mood === "happy" ? (
          <path
            d={`M ${s * 0.38} ${s * 0.64} Q ${s * 0.5} ${s * 0.74} ${s * 0.62} ${s * 0.64}`}
            stroke="#0a0a0a"
            strokeWidth={s * 0.02}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d={`M ${s * 0.38} ${s * 0.7} Q ${s * 0.5} ${s * 0.62} ${s * 0.62} ${s * 0.7}`}
            stroke="#0a0a0a"
            strokeWidth={s * 0.02}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Cheeks */}
        <circle cx={s * 0.28} cy={s * 0.6} r={s * 0.04} fill="#f43f5e" opacity={0.2} />
        <circle cx={s * 0.72} cy={s * 0.6} r={s * 0.04} fill="#f43f5e" opacity={0.2} />
      </svg>
    </motion.div>
  );
}

