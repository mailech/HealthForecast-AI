import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Database, Filter, Eye, Layers, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

export default function CohortConstellation3D({ cohortData = [], onSelectPoint }) {
  const mountRef = useRef(null);
  const [filterMode, setFilterMode] = useState('ALL');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040814, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 3, 40);
    pointLight.position.set(0, 15, 10);
    scene.add(pointLight);

    // 3D Grid Planes for coordinate visualization
    const gridXY = new THREE.GridHelper(24, 12, 0x00f5d4, 0x1e293b);
    gridXY.position.y = -6;
    scene.add(gridXY);

    // Axis Helper Labels
    const axisGroup = new THREE.Group();
    scene.add(axisGroup);

    // Constellation Node Group
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // Create Mesh Spheres for Raycasting
    const nodeMeshes = [];
    const sphereGeo = new THREE.SphereGeometry(0.35, 12, 12);

    const pointsToRender = cohortData.length > 0 ? cohortData : Array.from({ length: 220 }, (_, i) => {
      const stay = Math.floor(Math.random() * 12) + 1;
      const labs = Math.floor(Math.random() * 80) + 15;
      const emerg = Math.random() < 0.25 ? Math.floor(Math.random() * 4) + 1 : 0;
      const highA1c = Math.random() < 0.35;
      const isReadmit = (emerg > 0 && highA1c) || (stay > 7 && Math.random() < 0.6);
      const risk = isReadmit ? 'HIGH' : highA1c ? 'MODERATE' : 'LOW';
      return {
        cohort_id: `ENC-${1000 + i}`,
        position: [(stay - 6) * 2.2, (labs - 50) * 0.2, (emerg - 1) * 3.5],
        age_bracket: '[60-70)',
        time_in_hospital: stay,
        num_lab_procedures: labs,
        num_medications: 12 + Math.floor(Math.random() * 16),
        prior_emergencies: emerg,
        high_a1c: highA1c,
        readmitted_30d: isReadmit,
        risk_level: risk,
        color: risk === 'HIGH' ? '#ef4444' : risk === 'MODERATE' ? '#f59e0b' : '#10b981'
      };
    });

    // Filter points
    const activePoints = pointsToRender.filter((pt) => {
      if (filterMode === 'HIGH_RISK') return pt.risk_level === 'HIGH';
      if (filterMode === 'HIGH_A1C') return pt.high_a1c;
      if (filterMode === 'RAPID_RECOVERY') return pt.risk_level === 'LOW';
      return true;
    });

    // Create Interactive Patient Spheres
    activePoints.forEach((pt) => {
      const colorHex = pt.risk_level === 'HIGH' ? 0xef4444 : pt.risk_level === 'MODERATE' ? 0xf59e0b : 0x10b981;
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.3
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(pt.position[0], pt.position[1], pt.position[2]);
      mesh.userData = { ptData: pt, baseColor: colorHex };
      constellationGroup.add(mesh);
      nodeMeshes.push(mesh);
    });

    // Constellation Inter-link Lines for High Risk Cluster
    const highRiskNodes = nodeMeshes.filter(m => m.userData.ptData.risk_level === 'HIGH');
    if (highRiskNodes.length > 1) {
      const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.25 });
      const lineGeo = new THREE.BufferGeometry();
      const linePositions = [];

      for (let i = 0; i < Math.min(60, highRiskNodes.length - 1); i++) {
        const n1 = highRiskNodes[i].position;
        const n2 = highRiskNodes[i + 1].position;
        linePositions.push(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z);
      }
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const clusterLines = new THREE.LineSegments(lineGeo, lineMat);
      constellationGroup.add(clusterLines);
    }

    // Ambient Stardust Particles
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 30;
      starPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.05, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Interactive Drag Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0;
    let rotX = 0.2;
    let dist = 28;

    const updateCam = () => {
      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * dist;
      camera.position.y = Math.sin(rotX) * dist;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * dist;
      camera.lookAt(0, 0, 0);
    };
    updateCam();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        rotY -= dx * 0.007;
        rotX = Math.max(-0.6, Math.min(1.0, rotX + dy * 0.005));
        updateCam();
        prevMouse = { x: e.clientX, y: e.clientY };
      }

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        setHoveredPoint(hits[0].object.userData.ptData);
        container.style.cursor = 'pointer';
      } else {
        setHoveredPoint(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      dist = Math.max(12, Math.min(50, dist + e.deltaY * 0.03));
      updateCam();
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        const pt = hits[0].object.userData.ptData;
        if (onSelectPoint) onSelectPoint(pt);
        sound.playScan();
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow constellation cosmic rotation
      constellationGroup.rotation.y = t * 0.04;

      // Pulse high risk nodes
      nodeMeshes.forEach((mesh) => {
        if (mesh.userData.ptData.risk_level === 'HIGH') {
          const s = 1.0 + Math.sin(t * 4.0 + mesh.position.x) * 0.2;
          mesh.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cohortData, filterMode]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl glass-panel overflow-hidden border border-cyan-500/20 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Header */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
          <Database className="w-3.5 h-3.5" />
          3D Patient Risk Manifold & Cohort Constellation
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          Diabetes 130-US Hospitals Research Space
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          Axes: X=Length of Stay • Y=Lab Complexity • Z=Prior Emergency Encounters
        </p>
      </div>

      {/* Filter Mode Selector */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl z-10 text-xs font-mono">
        <Filter className="w-3.5 h-3.5 text-cyan-400 ml-1" />
        {[
          { id: 'ALL', label: 'All Cohorts' },
          { id: 'HIGH_RISK', label: 'High Readmit (<30d)' },
          { id: 'HIGH_A1C', label: 'HbA1c > 8.0%' },
          { id: 'RAPID_RECOVERY', label: 'Stable Recovery' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => {
              setFilterMode(btn.id);
              sound.playClick();
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterMode === btn.id
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Hovered Patient Tooltip */}
      {hoveredPoint && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${
              hoveredPoint.risk_level === 'HIGH' ? 'bg-red-950/70 border border-red-500/50 text-red-400' :
              hoveredPoint.risk_level === 'MODERATE' ? 'bg-amber-950/70 border border-amber-500/50 text-amber-400' :
              'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">De-Identified Subject {hoveredPoint.cohort_id}</span>
                <span className="text-xs text-slate-400 font-mono">Age {hoveredPoint.age_bracket}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  hoveredPoint.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                  hoveredPoint.risk_level === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {hoveredPoint.risk_level} READMISSION CLUSTER
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Hospital Stay: {hoveredPoint.time_in_hospital} days • Labs: {hoveredPoint.num_lab_procedures} • Medications: {hoveredPoint.num_medications} • Prior Emergencies: {hoveredPoint.prior_emergencies} • HbA1c: {hoveredPoint.high_a1c ? '>8% (Severe)' : 'Controlled'}
              </p>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">Readmitted &lt;30d</div>
            <div className={`text-base font-bold ${hoveredPoint.readmitted_30d ? 'text-red-400' : 'text-emerald-400'}`}>
              {hoveredPoint.readmitted_30d ? 'YES (High Hazard)' : 'NO (Discharged)'}
            </div>
          </div>
        </div>
      )}

      {/* Camera Navigation Hint */}
      <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-mono pointer-events-none">
        [Drag to Rotate Constellation • Scroll to Zoom In/Out • Click Node to Inspect]
      </div>
    </div>
  );
}
