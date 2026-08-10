"use client";

/**
 * Full-screen 3D login backdrop. Pure CSS 3D (transform-style: preserve-3d +
 * perspective) — a receding floor grid, three depth-staggered orbit rings,
 * a handful of floating "glass" data shards drifting on independent
 * translateZ/rotation loops, and an upward particle drift. No canvas/WebGL,
 * so it's cheap and renders identically everywhere.
 */
export function HealthForecastScene3D() {
  const shards = [
    { label: "Readmission risk", value: "12%", accent: "#5FE3D3", top: "14%", left: "8%", z: 60, dur: 16, size: 150 },
    { label: "Patients monitored", value: "3,482", accent: "#D6952E", top: "66%", left: "10%", z: -40, dur: 20, size: 150 },
    { label: "Model confidence", value: "94.2%", accent: "#8B5CD6", top: "20%", left: "78%", z: -60, dur: 18, size: 150 },
    { label: "30-day window", value: "Active", accent: "#5FE3D3", top: "70%", left: "80%", z: 40, dur: 22, size: 150 },
  ];

  const particles = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="hf-scene3d" aria-hidden="true">
      <div className="hf-scene3d__stage">
        {/* receding floor grid */}
        <div className="hf-scene3d__floor" />

        {/* depth-staggered orbit rings, dead center */}
        <div className="hf-scene3d__rings">
          <div className="hf-scene3d__ring hf-scene3d__ring--a" />
          <div className="hf-scene3d__ring hf-scene3d__ring--b" />
          <div className="hf-scene3d__ring hf-scene3d__ring--c" />
        </div>

        {/* floating glass data shards at varying depth */}
        {shards.map((s, i) => (
          <div
            key={i}
            className="hf-scene3d__shard"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              transform: `translateZ(${s.z}px)`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${i * -1.3}s`,
            }}
          >
            <div className="hf-scene3d__shard-dot" style={{ background: s.accent, boxShadow: `0 0 10px 2px ${s.accent}99` }} />
            <div>
              <div className="hf-scene3d__shard-value" style={{ color: s.accent }}>{s.value}</div>
              <div className="hf-scene3d__shard-label">{s.label}</div>
            </div>
          </div>
        ))}

        {/* drifting particles */}
        <div className="hf-scene3d__particles">
          {particles.map((p) => (
            <span
              key={p}
              className="hf-scene3d__particle"
              style={{
                left: `${(p * 37) % 100}%`,
                animationDuration: `${9 + (p % 7)}s`,
                animationDelay: `${-(p * 1.7) % 12}s`,
                opacity: 0.15 + ((p % 5) * 0.08),
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .hf-scene3d {
          position: absolute;
          inset: 0;
          overflow: hidden;
          perspective: 1400px;
          perspective-origin: 50% 40%;
        }
        .hf-scene3d__stage {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }

        /* floor */
        .hf-scene3d__floor {
          position: absolute;
          left: -50%;
          right: -50%;
          bottom: -10%;
          height: 70%;
          background-image:
            linear-gradient(rgba(95, 227, 211, 0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95, 227, 211, 0.14) 1px, transparent 1px);
          background-size: 64px 64px;
          transform: rotateX(78deg) translateZ(-40px);
          -webkit-mask-image: linear-gradient(to top, black, transparent 85%);
          mask-image: linear-gradient(to top, black, transparent 85%);
        }

        /* rings */
        .hf-scene3d__rings {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 560px;
          height: 560px;
          margin: -280px 0 0 -280px;
          transform-style: preserve-3d;
          animation: hf-scene3d-spin 34s linear infinite;
        }
        .hf-scene3d__ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(95, 227, 211, 0.16);
          transform-style: preserve-3d;
        }
        .hf-scene3d__ring--a { transform: rotateX(75deg) translateZ(0px); }
        .hf-scene3d__ring--b {
          inset: 12%;
          border-color: rgba(139, 92, 214, 0.16);
          transform: rotateX(75deg) rotateZ(35deg) translateZ(0px);
        }
        .hf-scene3d__ring--c {
          inset: 24%;
          border-color: rgba(214, 149, 46, 0.16);
          transform: rotateX(75deg) rotateZ(-35deg) translateZ(0px);
        }

        /* glass shards */
        .hf-scene3d__shard {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          animation-name: hf-scene3d-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          transform-style: preserve-3d;
        }
        .hf-scene3d__shard-dot {
          flex-shrink: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .hf-scene3d__shard-value {
          font-family: var(--font-mono), monospace;
          font-size: 15px;
          line-height: 1.1;
        }
        .hf-scene3d__shard-label {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 2px;
          white-space: nowrap;
        }

        /* particles */
        .hf-scene3d__particles {
          position: absolute;
          inset: 0;
        }
        .hf-scene3d__particle {
          position: absolute;
          bottom: -4%;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #5fe3d3;
          animation-name: hf-scene3d-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes hf-scene3d-spin {
          from { transform: rotateZ(0deg); }
          to { transform: rotateZ(360deg); }
        }
        @keyframes hf-scene3d-float {
          0%, 100% { transform: translateZ(var(--z, 0)) translateY(0px) rotateX(0deg) rotateY(0deg); }
          50% { transform: translateZ(var(--z, 0)) translateY(-14px) rotateX(3deg) rotateY(-3deg); }
        }
        @keyframes hf-scene3d-drift {
          from { transform: translateY(0) translateX(0); }
          to { transform: translateY(-108vh) translateX(24px); }
        }

        @media (max-width: 1023px) {
          .hf-scene3d__shard { display: none; }
        }
      `}</style>
    </div>
  );
}
