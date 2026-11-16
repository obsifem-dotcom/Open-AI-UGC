"use client";

import React from "react";

export function UgcSymbol({ className = "w-9 h-9", animated = false }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className} ${
        animated ? "transition-transform hover:scale-105 active:scale-95" : ""
      }`}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="ugc_bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F0C20" />
            <stop offset="50%" stopColor="#1E1238" />
            <stop offset="100%" stopColor="#090812" />
          </linearGradient>

          <linearGradient id="ugc_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          <linearGradient id="ugc_u" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E9D5FF" />
            <stop offset="35%" stopColor="#A855F7" />
            <stop offset="70%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          <linearGradient id="ugc_core" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#A5B4FC" />
          </linearGradient>

          <filter id="ugc_glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Squircle with Neon Rim */}
        <rect
          x="24"
          y="24"
          width="464"
          height="464"
          rx="112"
          fill="url(#ugc_bg)"
          stroke="url(#ugc_rim)"
          strokeWidth="6"
          strokeOpacity="0.85"
        />

        {/* Ambient Glow */}
        <circle
          cx="256"
          cy="250"
          r="170"
          fill="#8B5CF6"
          fillOpacity="0.18"
          filter="url(#ugc_glow)"
        />

        {/* Aperture Focus Ring */}
        <circle
          cx="256"
          cy="256"
          r="154"
          stroke="url(#ugc_rim)"
          strokeWidth="3.5"
          strokeDasharray="12 18"
          strokeOpacity="0.45"
        />

        {/* Stylized U Monogram */}
        <path
          d="M168 152 V272 C168 320 206 360 256 360 C306 360 344 320 344 272 V152 H302 V270 C302 296 281 316 256 316 C231 316 210 296 210 270 V152 H168 Z"
          fill="url(#ugc_u)"
        />

        {/* Inner AI Video Synthesis Core (Play) */}
        <polygon
          points="238 214, 238 290, 298 252"
          fill="url(#ugc_core)"
          filter="url(#ugc_glow)"
        />

        {/* AI Sparkle */}
        <path
          d="M370 120 C370 134 380 144 394 144 C380 144 370 154 370 168 C370 154 360 144 346 144 C360 144 370 134 370 120 Z"
          fill="#F472B6"
        />
      </svg>
    </div>
  );
}

export default function UgcLogo({
  className = "h-9",
  showText = true,
  animated = true,
}) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${
        animated ? "transition-transform hover:scale-[1.02] active:scale-95" : ""
      }`}
    >
      <UgcSymbol className={className} animated={false} />
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-lg font-black tracking-tight text-foreground flex items-center">
            <span>UGC</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#6366F1]">
              ore
            </span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A855F7]">
            Studio
          </span>
        </div>
      )}
    </div>
  );
}
