"use client";

import { motion } from "framer-motion";

type TravelGlobeProps = {
  lat: number;
  lng: number;
  label: string;
};

function projectToGlobe(lat: number, lng: number) {
  const x = 50 + (lng / 180) * 34;
  const y = 50 - (lat / 90) * 20;

  return {
    x: Math.max(16, Math.min(84, x)),
    y: Math.max(24, Math.min(76, y)),
  };
}

export function TravelGlobe({ lat, lng, label }: TravelGlobeProps) {
  const marker = projectToGlobe(lat, lng);

  return (
    <aside className="pointer-events-none fixed bottom-5 right-5 z-20 hidden text-[var(--atlas-chocolate)] md:block lg:bottom-8 lg:right-8">
      <div className="border border-[rgba(72,38,29,0.12)] bg-[rgba(251,248,241,0.9)] px-4 py-3 backdrop-blur-[2px]">
        <p className="text-[0.62rem] uppercase tracking-[0.28em]">Travel Marker</p>
        <motion.div
          animate={{ rotate: 360 }}
          className="mt-3"
          transition={{ duration: 36, ease: "linear", repeat: Infinity }}
        >
          <svg aria-hidden="true" className="h-24 w-24" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="42"
              stroke="rgba(72,38,29,0.18)"
              strokeWidth="1"
            />
            <ellipse
              cx="50"
              cy="50"
              fill="none"
              rx="28"
              ry="42"
              stroke="rgba(72,38,29,0.15)"
              strokeWidth="1"
            />
            <ellipse
              cx="50"
              cy="50"
              fill="none"
              rx="12"
              ry="42"
              stroke="rgba(72,38,29,0.15)"
              strokeWidth="1"
            />
            <path
              d="M10 50H90M18 33H82M18 67H82"
              fill="none"
              stroke="rgba(72,38,29,0.15)"
              strokeWidth="1"
            />
            <motion.circle
              animate={{ scale: [1, 1.2, 1] }}
              cx={marker.x}
              cy={marker.y}
              fill="var(--atlas-sun)"
              r="3.6"
              transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
            />
          </svg>
        </motion.div>
        <p className="mt-3 max-w-[7rem] text-[0.62rem] uppercase leading-5 tracking-[0.2em]">
          {label}
        </p>
      </div>
      {/* TODO: Replace this placeholder projection with a more precise globe route map if needed. */}
    </aside>
  );
}
