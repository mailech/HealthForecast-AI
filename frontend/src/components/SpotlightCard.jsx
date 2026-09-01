import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(16, 185, 129, 0.12)",
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/70 border-t border-white/10 shadow-2xl rounded-2xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] ${className}`}
      {...props}
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {/* Card Content Container */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
