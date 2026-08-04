import React from 'react';

export const RiskGauge = ({ score = 0, size = 180, showLabel = true }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Convert 0-100 to arc fill
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "#10b981"; // Emerald Low
  let label = "LOW RISK";
  let bgGlow = "rgba(16, 185, 129, 0.2)";

  if (score >= 60) {
    color = "#ef4444"; // High Crimson
    label = "HIGH RISK";
    bgGlow = "rgba(239, 68, 68, 0.25)";
  } else if (score >= 30) {
    color = "#f59e0b"; // Amber Medium
    label = "MEDIUM RISK";
    bgGlow = "rgba(245, 158, 11, 0.2)";
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow backdrop */}
        <div 
          className="absolute inset-0 rounded-full blur-xl transition-all duration-700" 
          style={{ background: bgGlow }}
        />
        
        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
            {score.toFixed(1)}%
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-1" style={{ color }}>
            {label}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
          <span>30-Day Readmission Probability</span>
        </div>
      )}
    </div>
  );
};
