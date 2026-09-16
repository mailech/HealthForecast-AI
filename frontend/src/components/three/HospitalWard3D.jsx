import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Building2, UserCheck, AlertTriangle, Bed, Zap } from 'lucide-react';
import { sound } from '../../utils/audio';

export default function HospitalWard3D({ beds = [], onSelectBed, selectedPatientId }) {
  const mountRef = useRef(null);
  const [hoveredBed, setHoveredBed] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a18, 0.025);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(12, 14, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0e1b38, 2.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    mainLight.position.set(15, 25, 15);
    scene.add(mainLight);

    const centerGlow = new THREE.PointLight(0x00f5d4, 3, 25);
    centerGlow.position.set(0, 4, 0);
    scene.add(centerGlow);

    // Architectural Floor Grid
    const floorGrid = new THREE.GridHelper(30, 30, 0x00f5d4, 0x15254d);
    floorGrid.position.y = -0.01;
    scene.add(floorGrid);

    // Ward Floor Slab
    const floorGeo = new THREE.BoxGeometry(26, 0.4, 26);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x071126,
      roughness: 0.6,
      metalness: 0.4
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    scene.add(floor);

    // Central Nursing Telemetry Hub
    const stationGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.9, 24);
    const stationMat = new THREE.MeshStandardMaterial({
      color: 0x0b1a38,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.25,
      metalness: 0.8,
      roughness: 0.2
    });
    const nurseStation = new THREE.Mesh(stationGeo, stationMat);
    nurseStation.position.set(0, 0.45, 0);
    scene.add(nurseStation);

    // Central Holographic Beacon Ring
    const beaconGeo = new THREE.TorusGeometry(1.6, 0.05, 16, 48);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.8 });
    const beaconRing = new THREE.Mesh(beaconGeo, beaconMat);
    beaconRing.rotation.x = Math.PI / 2;
    beaconRing.position.set(0, 1.8, 0);
    scene.add(beaconRing);

    // Bed Meshes and Raycasting Group
    const bedClickables = [];
    const rootWardGroup = new THREE.Group();
    scene.add(rootWardGroup);

    // Generate 3D Hospital Beds
    const bedDataList = beds.length > 0 ? beds : [
      { patient_id: 1, name: 'Robert Chen', mrn: 'MRN-89421', ward: 'Endocrinology Wing', bed_number: 'BED-101', risk_category: 'HIGH', color: '#ef4444', position: [-6, 0.4, -6] },
      { patient_id: 2, name: 'Eleanor Davies', mrn: 'MRN-89422', ward: 'Endocrinology Wing', bed_number: 'BED-102', risk_category: 'HIGH', color: '#ef4444', position: [-2, 0.4, -6] },
      { patient_id: 3, name: 'David Kowalski', mrn: 'MRN-89423', ward: 'Cardiology Step-Down', bed_number: 'BED-201', risk_category: 'MODERATE', color: '#f59e0b', position: [2, 0.4, -6] },
      { patient_id: 4, name: 'Maria Rodriguez', mrn: 'MRN-89424', ward: 'General Medicine', bed_number: 'BED-301', risk_category: 'LOW', color: '#10b981', position: [6, 0.4, -6] },
      { patient_id: 5, name: 'James Thorne', mrn: 'MRN-89425', ward: 'ICU Critical Care', bed_number: 'BED-ICU-01', risk_category: 'HIGH', color: '#ef4444', position: [-6, 0.4, 6] },
      { patient_id: 6, name: 'Sophia Patel', mrn: 'MRN-89426', ward: 'Endocrinology Wing', bed_number: 'BED-103', risk_category: 'LOW', color: '#10b981', position: [-2, 0.4, 6] },
      { patient_id: 7, name: 'Arthur Pendelton', mrn: 'MRN-89427', ward: 'Cardiology Step-Down', bed_number: 'BED-202', risk_category: 'MODERATE', color: '#f59e0b', position: [2, 0.4, 6] },
      { patient_id: 8, name: 'Clara Oswald', mrn: 'MRN-89428', ward: 'General Medicine', bed_number: 'BED-302', risk_category: 'LOW', color: '#10b981', position: [6, 0.4, 6] }
    ];

    bedDataList.forEach((b) => {
      const bedGroup = new THREE.Group();
      bedGroup.position.set(b.position[0], b.position[1], b.position[2]);

      const riskColorHex = b.color === '#ef4444' ? 0xef4444 : b.color === '#f59e0b' ? 0xf59e0b : 0x10b981;

      // Bed Base Frame
      const frameGeo = new THREE.BoxGeometry(1.8, 0.35, 2.8);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      bedGroup.add(frame);

      // Mattress
      const matGeo = new THREE.BoxGeometry(1.6, 0.25, 2.6);
      const matMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: riskColorHex,
        emissiveIntensity: 0.15
      });
      const mattress = new THREE.Mesh(matGeo, matMat);
      mattress.position.y = 0.3;
      bedGroup.add(mattress);

      // Pillow
      const pilGeo = new THREE.BoxGeometry(1.2, 0.15, 0.6);
      const pilMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const pillow = new THREE.Mesh(pilGeo, pilMat);
      pillow.position.set(0, 0.48, -0.9);
      bedGroup.add(pillow);

      // IV Drip Pole
      const ivPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8);
      const ivPoleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const ivPole = new THREE.Mesh(ivPoleGeo, ivPoleMat);
      ivPole.position.set(-1.0, 1.0, -1.0);
      bedGroup.add(ivPole);

      const ivBagGeo = new THREE.BoxGeometry(0.2, 0.35, 0.15);
      const ivBagMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.8 });
      const ivBag = new THREE.Mesh(ivBagGeo, ivBagMat);
      ivBag.position.set(-1.0, 1.9, -1.0);
      bedGroup.add(ivBag);

      // Hovering Risk Halo Beacon
      const haloGeo = new THREE.TorusGeometry(0.5, 0.04, 12, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: riskColorHex, transparent: true, opacity: 0.9 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(0, 1.6, 0);
      bedGroup.add(halo);

      // Patient Raycast Hitbox
      const hitboxGeo = new THREE.BoxGeometry(2.4, 2.6, 3.2);
      const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
      hitbox.position.y = 0.9;
      hitbox.userData = { bedData: b, halo, group: bedGroup };
      bedGroup.add(hitbox);
      bedClickables.push(hitbox);

      rootWardGroup.add(bedGroup);
    });

    // Patient Intake / Transfer Particle Stream
    const streamParticleCount = 120;
    const streamGeo = new THREE.BufferGeometry();
    const streamPos = new Float32Array(streamParticleCount * 3);
    for (let i = 0; i < streamParticleCount * 3; i += 3) {
      streamPos[i] = (Math.random() - 0.5) * 18;
      streamPos[i + 1] = 0.2 + Math.random() * 0.4;
      streamPos[i + 2] = (Math.random() - 0.5) * 18;
    }
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPos, 3));
    const streamMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.08,
      transparent: true,
      opacity: 0.7
    });
    const flowParticles = new THREE.Points(streamGeo, streamMat);
    scene.add(flowParticles);

    // Interactive Orbit Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let rotAngle = 0.6;
    let elevationAngle = 0.55;
    let camDistance = 22;

    const updateCameraPosition = () => {
      camera.position.x = Math.sin(rotAngle) * Math.cos(elevationAngle) * camDistance;
      camera.position.y = Math.sin(elevationAngle) * camDistance;
      camera.position.z = Math.cos(rotAngle) * Math.cos(elevationAngle) * camDistance;
      camera.lookAt(0, 1, 0);
    };
    updateCameraPosition();

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
        rotAngle -= deltaX * 0.007;
        elevationAngle = Math.max(0.2, Math.min(1.2, elevationAngle + deltaY * 0.005));
        updateCameraPosition();
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      // Check hover on beds
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bedClickables);
      if (intersects.length > 0) {
        const data = intersects[0].object.userData.bedData;
        setHoveredBed(data);
        container.style.cursor = 'pointer';
      } else {
        setHoveredBed(null);
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      camDistance = Math.max(12, Math.min(35, camDistance + e.deltaY * 0.02));
      updateCameraPosition();
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bedClickables);
      if (intersects.length > 0) {
        const data = intersects[0].object.userData.bedData;
        if (onSelectBed) onSelectBed(data);
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
      const elapsed = clock.getElapsedTime();

      // Beacon rotation
      beaconRing.rotation.z = elapsed * 0.5;

      // Bed Halo floating animation
      bedClickables.forEach((b) => {
        const halo = b.userData.halo;
        halo.position.y = 1.6 + Math.sin(elapsed * 2.5 + b.userData.bedData.patient_id) * 0.15;
        halo.rotation.z = elapsed * 0.8;
      });

      // Particle flow circulation
      const posAttr = streamGeo.attributes.position;
      for (let i = 0; i < streamParticleCount * 3; i += 3) {
        posAttr.array[i + 2] += 0.04;
        if (posAttr.array[i + 2] > 12) {
          posAttr.array[i + 2] = -12;
        }
      }
      posAttr.needsUpdate = true;

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
  }, [beds]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl glass-panel overflow-hidden border border-cyan-500/20 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
          <Building2 className="w-3.5 h-3.5" />
          3D Smart Facility & Ward Digital Twin
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          Metro General Hospital Inpatient Wards
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          Interactive 3D Bed Matrix • Live Readmission Risk Halos • Real-Time Census
        </p>
      </div>

      {/* Legend Top Right */}
      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs font-mono z-10">
        <div className="text-slate-400 font-bold mb-1.5 uppercase text-[10px]">Risk Halo Status</div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-glow-red animate-pulse" />
          <span className="text-red-300">High Readmit (&lt;30d)</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-amber" />
          <span className="text-amber-300">Moderate Risk (&gt;30d)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
          <span className="text-emerald-300">Low Risk (Stable)</span>
        </div>
      </div>

      {/* Hovered Bed Popover */}
      {hoveredBed && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${
              hoveredBed.risk_category === 'HIGH' ? 'bg-red-950/70 border border-red-500/50 text-red-400' :
              hoveredBed.risk_category === 'MODERATE' ? 'bg-amber-950/70 border border-amber-500/50 text-amber-400' :
              'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400'
            }`}>
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{hoveredBed.name}</span>
                <span className="text-xs text-slate-400 font-mono">({hoveredBed.mrn})</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  hoveredBed.risk_category === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                  hoveredBed.risk_category === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {hoveredBed.risk_category} RISK
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {hoveredBed.ward} • Unit {hoveredBed.bed_number} • Status: {hoveredBed.status}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectBed && onSelectBed(hoveredBed)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Open Clinical Profile
          </button>
        </div>
      )}

      {/* Camera Navigation Hint */}
      <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-mono pointer-events-none">
        [Drag to Orbit • Scroll to Zoom • Click Bed to Inspect Patient]
      </div>
    </div>
  );
}
