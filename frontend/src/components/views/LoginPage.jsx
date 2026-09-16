import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Activity, Shield, Stethoscope, Building2, Database,
  Settings, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { sound } from '../../utils/audio';

const QUICK_DEMO_ACCOUNTS = [
  {
    role: 'doctor',
    label: 'Doctor / Physician',
    icon: Stethoscope,
    name: 'Dr. Elena Vance, MD',
    email: 'doctor@healthforecast.ai',
    password: 'doctor123',
    dept: 'Endocrinology & Cardiology',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300'
  },
  {
    role: 'hospital_admin',
    label: 'Hospital Administrator',
    icon: Building2,
    name: 'Marcus Sterling, MHA',
    email: 'admin@healthforecast.ai',
    password: 'admin123',
    dept: 'Executive Operations',
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300'
  },
  {
    role: 'healthcare_researcher',
    label: 'Healthcare Researcher',
    icon: Database,
    name: 'Dr. Aris Thorne, PhD',
    email: 'researcher@healthforecast.ai',
    password: 'research123',
    dept: 'Epidemiology & Biostatistics',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-300'
  },
  {
    role: 'system_admin',
    label: 'System Administrator',
    icon: Settings,
    name: 'Alex Mercer',
    email: 'sysadmin@healthforecast.ai',
    password: 'sysadmin123',
    dept: 'Healthcare IT & DevOps',
    color: 'from-red-500/20 to-amber-500/10 border-red-500/40 text-red-300'
  }
];

export default function LoginPage({ onLoginSuccess }) {
  const mountRef = useRef(null);
  const [email, setEmail] = useState('doctor@healthforecast.ai');
  const [password, setPassword] = useState('doctor123');
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 3D Background: Glowing Cyber DNA Helix & Floating Medical Particle Matrix
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x061126, 2.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5d4, 3, 30);
    cyanLight.position.set(5, 5, 8);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 30);
    purpleLight.position.set(-6, -4, 6);
    scene.add(purpleLight);

    // 3D DNA Double Helix Structure
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    const strandPoints1 = [];
    const strandPoints2 = [];
    const sphereGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const strand1Mat = new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 0.8 });
    const strand2Mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.8 });
    const rungMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.4 });

    const totalNodes = 40;
    const heightSpan = 18;
    const radius = 2.4;

    for (let i = 0; i < totalNodes; i++) {
      const t = (i / totalNodes) * Math.PI * 4;
      const y = (i / totalNodes) * heightSpan - heightSpan / 2;
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      // Node on strand 1
      const m1 = new THREE.Mesh(sphereGeo, strand1Mat);
      m1.position.set(x1, y, z1);
      helixGroup.add(m1);

      // Node on strand 2
      const m2 = new THREE.Mesh(sphereGeo, strand2Mat);
      m2.position.set(x2, y, z2);
      helixGroup.add(m2);

      // Connecting rung
      const rungGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2)
      ]);
      const rung = new THREE.Line(rungGeo, rungMat);
      helixGroup.add(rung);
    }

    // Ambient floating particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 35;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x00f5d4, size: 0.06, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Subtle mouse tilt
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    let clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      helixGroup.rotation.y = elapsed * 0.3 + mouseX * 0.5;
      helixGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.1 + mouseY * 0.2;
      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleSelectDemo = (acc) => {
    sound.playClick();
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    sound.playScan();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      sound.playSuccess();
      localStorage.setItem('healthforecast_token', data.access_token);
      localStorage.setItem('healthforecast_user', JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.access_token);
      }
    } catch (err) {
      sound.playAlert();
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030713] text-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* 3D Canvas Background */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-75" />

      {/* Futuristic Background Vignette & Grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030713] via-transparent to-[#030713]/80 z-0 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-30 z-0 pointer-events-none" />

      {/* Central Login Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto">
        
        {/* Left Column: Project Identity & 3D Feature Highlights (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 lg:p-8 border border-cyan-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-glow-cyan flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-wider text-white font-mono flex items-center gap-1.5">
                  HEALTHFORECAST<span className="text-cyan-400">AI</span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    3D SPATIAL INTEL
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    INFOSYS INTERNSHIP
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <h2 className="text-lg font-bold text-white leading-snug">
                Hospital Readmission Prediction & Patient Risk Intelligence System
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enterprise AI healthcare analytics platform leveraging the Diabetes 130-US Hospitals cohort dataset, explainable AI hazard drivers, and interactive 3D clinical digital twins.
              </p>
            </div>

            {/* 3D Capabilities List */}
            <div className="space-y-2.5 pt-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>3D Holographic Patient Twin:</strong> Real-time organ bio-telemetry (Heart, Pancreas, Kidneys) and dynamic risk aura.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span><strong>3D Hospital Smart Ward:</strong> 16-bed inpatient facility with readmission flow vectors.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span><strong>3D Risk Cohort Constellation:</strong> 400+ patient encounters in multidimensional clinical space.</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Security: SHA-256 / JWT Auth</span>
            <span className="text-cyan-400/80">v2.0 Active</span>
          </div>
        </div>

        {/* Right Column: Interactive Login Form & 1-Click Role Switcher (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 lg:p-8 border border-cyan-500/30 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Access Portal Login</h3>
                <p className="text-xs text-slate-400">Select a pre-configured role below or enter credentials</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400" />
                RBAC PROTECTED
              </div>
            </div>

            {/* Quick 1-Click Demo Accounts Grid */}
            <div className="mb-5">
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                1-Click Demo Role Accounts:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = selectedRole === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemo(acc)}
                      className={`p-2.5 rounded-xl border text-left transition-all bg-gradient-to-r flex items-center gap-2.5 ${acc.color} ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 shadow-glow-cyan bg-slate-900/90'
                          : 'opacity-85 hover:opacity-100 bg-slate-950/60'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/10">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate text-white">{acc.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{acc.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Authorized Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 transition-all font-mono"
                    placeholder="physician@healthforecast.ai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/80 transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Authenticating Role Identity...</span>
                ) : (
                  <>
                    <span>Enter HealthForecast AI Workspace</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              Diabetes 130-US Hospitals Dataset Engine • Fast Inference • Three.js 60fps
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
