"use client";

/**
 * A genuinely 3D version of the brand mark: three rings positioned at
 * different depths/rotations in 3D space (via CSS `transform-style:
 * preserve-3d` + `rotate3d`) that continuously rotate, with the pulse line
 * and a floating data dot orbiting on their own axes. Pure CSS — no canvas
 * or WebGL — so it's cheap and reliable everywhere.
 */
export function HealthForecastMark3D({ size = 280 }: { size?: number }) {
  return (
    <div
      className="hfm3d-scene"
      style={{ width: size, height: size, perspective: `${size * 3.5}px` }}
    >
      <div className="hfm3d-rig">
        <div className="hfm3d-ring hfm3d-ring--outer" />
        <div className="hfm3d-ring hfm3d-ring--mid" />
        <div className="hfm3d-ring hfm3d-ring--inner" />

        <div className="hfm3d-pulse-orbit">
          <svg className="hfm3d-pulse" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 20 H13 L16 12 L20 28 L24 14 L27 20 H36"
              stroke="#5FE3D3"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <div className="hfm3d-dot hfm3d-dot--a" />
        <div className="hfm3d-dot hfm3d-dot--b" />
        <div className="hfm3d-core" />
      </div>

      <style jsx>{`
        .hfm3d-scene {
          position: relative;
          margin: 0 auto;
        }
        .hfm3d-rig {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          animation: hfm3d-spin 14s linear infinite;
        }
        .hfm3d-ring {
          position: absolute;
          inset: 6%;
          border-radius: 50%;
          border: 1.4px solid rgba(95, 227, 211, 0.55);
          transform-style: preserve-3d;
        }
        .hfm3d-ring--outer {
          transform: rotateX(72deg) rotateZ(0deg);
          border-color: rgba(95, 227, 211, 0.28);
        }
        .hfm3d-ring--mid {
          inset: 16%;
          transform: rotateX(58deg) rotateY(20deg);
          border-color: rgba(95, 227, 211, 0.45);
        }
        .hfm3d-ring--inner {
          inset: 28%;
          transform: rotateX(40deg) rotateY(-15deg);
          border-color: rgba(95, 227, 211, 0.75);
        }
        .hfm3d-pulse-orbit {
          position: absolute;
          inset: 18%;
          transform-style: preserve-3d;
          animation: hfm3d-pulse-spin 5s linear infinite;
        }
        .hfm3d-pulse {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: translateZ(20px);
          filter: drop-shadow(0 0 8px rgba(95, 227, 211, 0.75));
        }
        .hfm3d-core {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 10px;
          height: 10px;
          margin: -5px 0 0 -5px;
          border-radius: 50%;
          background: #5fe3d3;
          box-shadow: 0 0 16px 4px rgba(95, 227, 211, 0.7);
          transform: translateZ(18px);
        }
        .hfm3d-dot {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d6952e;
          box-shadow: 0 0 8px 2px rgba(214, 149, 46, 0.7);
        }
        .hfm3d-dot--a {
          top: 8%;
          left: 50%;
          transform: translateZ(30px) translateX(-50%);
          animation: hfm3d-orbit-a 6s linear infinite;
        }
        .hfm3d-dot--b {
          top: 50%;
          left: 92%;
          background: #8b5cd6;
          box-shadow: 0 0 8px 2px rgba(139, 92, 214, 0.7);
          animation: hfm3d-orbit-b 9s linear infinite;
        }

        @keyframes hfm3d-spin {
          from {
            transform: rotateY(0deg) rotateX(4deg);
          }
          to {
            transform: rotateY(360deg) rotateX(4deg);
          }
        }
        @keyframes hfm3d-pulse-spin {
          from {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          to {
            transform: rotateY(-360deg) rotateZ(360deg);
          }
        }
        @keyframes hfm3d-orbit-a {
          from {
            transform: translateZ(30px) translateX(-50%) rotate(0deg) translateY(-90px) rotate(0deg);
          }
          to {
            transform: translateZ(30px) translateX(-50%) rotate(360deg) translateY(-90px) rotate(-360deg);
          }
        }
        @keyframes hfm3d-orbit-b {
          from {
            transform: translateZ(-20px) rotate(0deg) translateX(70px) rotate(0deg);
          }
          to {
            transform: translateZ(-20px) rotate(-360deg) translateX(70px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
