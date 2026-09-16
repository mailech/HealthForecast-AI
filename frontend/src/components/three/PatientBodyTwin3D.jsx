import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Heart, ShieldAlert, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { sound } from '../../utils/audio';

export default function PatientBodyTwin3D({
  patient,
  riskScore = 45,
  riskCategory = 'MODERATE',
  organRisks = {},
  onSelectOrgan
}) {
  const mountRef = useRef(null);
  const [selectedOrganKey, setSelectedOrganKey] = useState('pancreas');
  const [hoveredOrgan, setHoveredOrgan] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient Lighting & Sci-Fi Rim Lights
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.0);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f5d4, 3, 20);
    cyanLight.position.set(3, 4, 4);
    scene.add(cyanLight);

    const blueRimLight = new THREE.PointLight(0x38bdf8, 2, 20);
    blueRimLight.position.set(-3, 2, -3);
    scene.add(blueRimLight);

    // Dynamic Risk Light
    const riskColorHex = riskCategory === 'HIGH' ? 0xef4444 : riskCategory === 'MODERATE' ? 0xf59e0b : 0x10b981;
    const riskLight = new THREE.PointLight(riskColorHex, 2.5, 15);
    riskLight.position.set(0, 1.8, 2);
    scene.add(riskLight);

    // Root Body Group for Rotation
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    // Hologram Wireframe Material
    const bodyWireMaterial = new THREE.MeshBasicMaterial({
      color: riskColorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    const bodySolidMaterial = new THREE.MeshStandardMaterial({
      color: 0x051329,
      emissive: riskColorHex,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.5,
      roughness: 0.3,
      metalness: 0.8
    });

    // Anatomical Body Segments
    // 1. Head & Cranium
    const headGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const head = new THREE.Mesh(headGeo, bodySolidMaterial);
    head.position.y = 3.6;
    bodyGroup.add(head);

    const headWire = new THREE.Mesh(headGeo, bodyWireMaterial);
    headWire.position.y = 3.6;
    bodyGroup.add(headWire);

    // 2. Neck
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 16);
    const neck = new THREE.Mesh(neckGeo, bodySolidMaterial);
    neck.position.y = 3.15;
    bodyGroup.add(neck);

    // 3. Chest & Thorax
    const chestGeo = new THREE.CylinderGeometry(0.7, 0.55, 1.2, 16);
    const chest = new THREE.Mesh(chestGeo, bodySolidMaterial);
    chest.position.y = 2.4;
    bodyGroup.add(chest);

    const chestWire = new THREE.Mesh(chestGeo, bodyWireMaterial);
    chestWire.position.y = 2.4;
    bodyGroup.add(chestWire);

    // 4. Abdomen & Pelvis
    const abdomenGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.0, 16);
    const abdomen = new THREE.Mesh(abdomenGeo, bodySolidMaterial);
    abdomen.position.y = 1.35;
    bodyGroup.add(abdomen);

    const abdomenWire = new THREE.Mesh(abdomenGeo, bodyWireMaterial);
    abdomenWire.position.y = 1.35;
    bodyGroup.add(abdomenWire);

    // 5. Arms
    const createLimb = (x, y, z, len, radius, angleZ) => {
      const geo = new THREE.CylinderGeometry(radius * 0.9, radius, len, 12);
      const mesh = new THREE.Mesh(geo, bodySolidMaterial);
      mesh.position.set(x, y, z);
      mesh.rotation.z = angleZ;
      bodyGroup.add(mesh);

      const wire = new THREE.Mesh(geo, bodyWireMaterial);
      wire.position.set(x, y, z);
      wire.rotation.z = angleZ;
      bodyGroup.add(wire);
    };

    createLimb(-0.95, 2.1, 0, 1.3, 0.14, 0.2); // Left Upper Arm
    createLimb(0.95, 2.1, 0, 1.3, 0.14, -0.2); // Right Upper Arm
    createLimb(-1.1, 0.9, 0, 1.2, 0.11, 0.1);  // Left Forearm
    createLimb(1.1, 0.9, 0, 1.2, 0.11, -0.1);  // Right Forearm

    // 6. Legs
    createLimb(-0.4, -0.2, 0, 1.8, 0.22, 0.05); // Left Thigh
    createLimb(0.4, -0.2, 0, 1.8, 0.22, -0.05); // Right Thigh
    createLimb(-0.4, -1.9, 0, 1.7, 0.17, 0.02); // Left Calf
    createLimb(0.4, -1.9, 0, 1.7, 0.17, -0.02); // Right Calf

    // Sci-Fi Medical Platform & Rings
    const ringGeo1 = new THREE.RingGeometry(1.6, 1.65, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f5d4, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = -2.8;
    scene.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.1, 2.15, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: riskColorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -2.8;
    scene.add(ring2);

    // Bio-Scan Laser Ring (moves vertically)
    const scanRingGeo = new THREE.RingGeometry(1.1, 1.15, 32);
    const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    bodyGroup.add(scanRing);

    // Particle Cloud / Bio-Atmosphere
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3.5;
      positions[i + 1] = Math.random() * 6.5 - 2.5;
      positions[i + 2] = (Math.random() - 0.5) * 3.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.045,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Interactive 3D Organ Nodes
    const organObjects = [];

    const createOrganNode = (key, name, pos, color, baseSize = 0.22) => {
      const group = new THREE.Group();
      group.position.set(...pos);

      // Core pulsing sphere
      const geo = new THREE.IcosahedronGeometry(baseSize, 2);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.2
      });
      const core = new THREE.Mesh(geo, mat);
      group.add(core);

      // Pulsing outer halo
      const haloGeo = new THREE.SphereGeometry(baseSize * 1.5, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      group.add(halo);

      group.userData = { key, name, color, core, halo, baseScale: 1.0 };
      bodyGroup.add(group);
      organObjects.push(group);
      return group;
    };

    // Instantiate Organs with dynamic clinical colors
    const getOrganColor = (risk) => {
      if (risk === 'CRITICAL' || risk === 'HIGH') return 0xef4444; // Red
      if (risk === 'MODERATE') return 0xf59e0b; // Amber
      return 0x10b981; // Green
    };

    const heartColor = getOrganColor(organRisks?.heart?.risk_level);
    const pancreasColor = getOrganColor(organRisks?.pancreas?.risk_level);
    const kidneyColor = getOrganColor(organRisks?.kidneys?.risk_level);
    const lungsColor = getOrganColor(organRisks?.lungs?.risk_level);
    const brainColor = getOrganColor(organRisks?.brain?.risk_level);

    createOrganNode('heart', 'Cardiovascular System', [0.22, 2.55, 0.35], heartColor, 0.22);
    createOrganNode('pancreas', 'Pancreatic Endocrine System', [0.0, 1.65, 0.3], pancreasColor, 0.19);
    createOrganNode('kidneys', 'Renal Filtration System', [-0.35, 1.35, -0.15], kidneyColor, 0.17);
    createOrganNode('lungs', 'Respiratory System', [-0.3, 2.65, 0.25], lungsColor, 0.20);
    createOrganNode('brain', 'Cerebrovascular Apex', [0.0, 3.65, 0.1], brainColor, 0.24);

    // Mouse Interaction: Orbit, Raycasting
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        targetRotationY += deltaX * 0.008;
        targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX + deltaY * 0.005));
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      // Check hover on organ nodes
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        organObjects.map(o => o.userData.core)
      );

      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        setHoveredOrgan(hitGroup.userData.key);
        container.style.cursor = 'pointer';
      } else {
        setHoveredOrgan(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        organObjects.map(o => o.userData.core)
      );

      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        const key = hitGroup.userData.key;
        setSelectedOrganKey(key);
        if (onSelectOrgan) onSelectOrgan(key);
        sound.playScan();
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotation dampening
      bodyGroup.rotation.y += (targetRotationY - bodyGroup.rotation.y) * 0.08;
      bodyGroup.rotation.x += (targetRotationX - bodyGroup.rotation.x) * 0.08;

      // Platform ring rotation
      ring1.rotation.z = elapsedTime * 0.2;
      ring2.rotation.z = -elapsedTime * 0.15;

      // Bio-scan vertical sweep
      scanRing.position.y = 1.0 + Math.sin(elapsedTime * 2.2) * 2.3;

      // Subtle float
      bodyGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      // Heartbeat pulse & organ animation
      organObjects.forEach((organ) => {
        const key = organ.userData.key;
        let scale = 1.0;

        if (key === 'heart') {
          // Double systolic heartbeat rhythm
          const beat = Math.sin(elapsedTime * 5.0);
          scale = 1.0 + (beat > 0.6 ? 0.25 : 0.0);
        } else if (key === 'pancreas') {
          scale = 1.0 + Math.sin(elapsedTime * 3.0) * 0.12;
        } else {
          scale = 1.0 + Math.sin(elapsedTime * 2.0 + organ.position.y) * 0.08;
        }

        // Highlight selected organ
        if (key === selectedOrganKey) {
          scale *= 1.35;
          organ.userData.halo.rotation.y += 0.04;
          organ.userData.halo.rotation.z += 0.02;
        }

        organ.scale.set(scale, scale, scale);
      });

      // Particle gentle rotation
      particles.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
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
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [riskCategory, organRisks, selectedOrganKey]);

  const activeOrganData = organRisks[selectedOrganKey] || {
    label: 'Endocrine System',
    risk_level: 'CRITICAL',
    score: 88,
    details: 'Uncontrolled glycated hemoglobin (HbA1c > 8.0%) driving readmission risk.'
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl glass-panel overflow-hidden border border-cyan-500/20 shadow-2xl">
      {/* 3D Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left HUD: Patient & Telemetry Info */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Holographic 3D Digital Twin
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          {patient?.full_name || 'Patient Digital Twin'}
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          MRN: {patient?.mrn || 'MRN-89421'} • Ward: {patient?.ward || 'Endocrinology Wing'}
        </p>
      </div>

      {/* Top Right HUD: Real-Time 30-Day Readmission Risk Gauge */}
      <div className="absolute top-4 right-4 text-right pointer-events-none">
        <div className="text-xs font-mono uppercase text-slate-400">30-Day Readmission Risk</div>
        <div className={`text-4xl font-extrabold font-mono tracking-tight ${
          riskCategory === 'HIGH' ? 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' :
          riskCategory === 'MODERATE' ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]' :
          'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]'
        }`}>
          {riskScore}%
        </div>
        <div className="flex items-center justify-end gap-1 text-xs font-semibold">
          {riskCategory === 'HIGH' && <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> CRITICAL RISK</span>}
          {riskCategory === 'MODERATE' && <span className="text-amber-400 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> MODERATE RISK</span>}
          {riskCategory === 'LOW' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> STABLE RECOVERY</span>}
        </div>
      </div>

      {/* Organ Selector Quick Chips */}
      <div className="absolute bottom-28 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1 z-10">
        {[
          { key: 'pancreas', label: 'Pancreas / Endocrine', icon: Zap },
          { key: 'heart', label: 'Cardiovascular', icon: Heart },
          { key: 'kidneys', label: 'Renal / Kidneys', icon: Activity },
          { key: 'lungs', label: 'Respiratory', icon: ShieldAlert },
          { key: 'brain', label: 'Cerebrovascular', icon: Activity }
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedOrganKey === item.key;
          const organStat = organRisks[item.key];
          const isRisk = organStat?.risk_level === 'CRITICAL' || organStat?.risk_level === 'HIGH';

          return (
            <button
              key={item.key}
              onClick={() => {
                setSelectedOrganKey(item.key);
                if (onSelectOrgan) onSelectOrgan(item.key);
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-md ${
                isSelected
                  ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-glow-cyan'
                  : 'bg-slate-900/60 border border-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isRisk ? 'text-red-400' : 'text-cyan-400'}`} />
              <span>{item.label}</span>
              {isRisk && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry Card: Inspected Organ Details */}
      <div className="absolute bottom-3 left-4 right-4 bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between shadow-2xl z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            activeOrganData.risk_level === 'CRITICAL' || activeOrganData.risk_level === 'HIGH'
              ? 'bg-red-950/70 border border-red-500/50 text-red-400'
              : activeOrganData.risk_level === 'MODERATE'
              ? 'bg-amber-950/70 border border-amber-500/50 text-amber-400'
              : 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400'
          }`}>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white text-sm">
                {activeOrganData.label || selectedOrganKey.toUpperCase()}
              </h4>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                activeOrganData.risk_level === 'CRITICAL' || activeOrganData.risk_level === 'HIGH'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : activeOrganData.risk_level === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {activeOrganData.risk_level} SEVERITY
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl line-clamp-1">
              {activeOrganData.details}
            </p>
          </div>
        </div>

        <div className="text-right pl-4 border-l border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono">Organ Risk Index</div>
          <div className="text-lg font-bold text-cyan-300 font-mono">
            {activeOrganData.score || 75} / 100
          </div>
        </div>
      </div>

      {/* Interactive Controls Overlay Hint */}
      <div className="absolute top-1/2 left-3 -translate-y-1/2 flex flex-col gap-1 text-[10px] text-slate-500 font-mono pointer-events-none opacity-60">
        <div>[Drag to Rotate 360°]</div>
        <div>[Click Nodes to Inspect]</div>
      </div>
    </div>
  );
}
