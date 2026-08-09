import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, HeartPulse, HelpCircle } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      
      {/* Background Decorative Radial Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-white max-w-lg w-full rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col items-center text-center relative z-10">
        
        {/* Large Custom Vector Illustration Area */}
        <div className="relative mb-6 flex items-center justify-center">
          
          {/* Subtle Pulse Glow Behind Illustration */}
          <div className="absolute w-36 h-36 bg-blue-500/15 rounded-full blur-2xl animate-pulse" />

          {/* SVG Illustration */}
          <svg
            className="w-48 h-48 relative z-10"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Medical Cross Grid */}
            <circle cx="100" cy="100" r="80" fill="#F1F5F9" />
            <path
              d="M70 100H130M100 70V130"
              stroke="#E2E8F0"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Broken Stethoscope Wire / ECG Path */}
            <path
              d="M30 100 Q 60 70 80 100 T 110 130 T 140 100 T 170 100"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Heart Pulse Icon Center */}
            <rect
              x="75"
              y="75"
              width="50"
              height="50"
              rx="16"
              fill="#2563EB"
              className="shadow-lg"
            />
            <path
              d="M90 100L96 94L100 104L104 96L110 100"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Large 404 Text */}
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 tracking-tight">
          404
        </h1>

        {/* Oops Subtitle */}
        <h2 className="text-2xl font-bold text-slate-800 mt-2">
          Oops!
        </h2>

        {/* Description */}
        <p className="text-slate-500 text-xs md:text-sm mt-2 max-w-xs leading-relaxed font-medium">
          This page doesn't exist or has been moved within the hospital portal.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full">
          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Home size={16} /> 🏠 Dashboard
          </button>

          {/* Go Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all duration-200 active:scale-95 cursor-pointer border border-slate-200/80"
          >
            <ArrowLeft size={16} /> ← Go Back
          </button>
        </div>

        {/* Footer Support Tag */}
        <div className="mt-8 text-[11px] text-slate-400 flex items-center gap-1">
          <HelpCircle size={13} /> Need assistance? Contact HealthForecast AI Support.
        </div>

      </div>
    </div>
  );
}

export default NotFound;