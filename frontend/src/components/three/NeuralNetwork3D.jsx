import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Cpu, Activity, Zap, CheckCircle } from 'lucide-react';
import { sound } from '../../utils/audio';

export default function NeuralNetwork3D({ activeModel = 'RandomForest', metrics = {} }) {
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x0a1428, 2.0);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00f5d4, 3, 30);
    cyanPoint.position.set(0, 10, 15);
    scene.add(cyanPoint);

    const bluePoint = new THREE.PointLight(0x38bdf8, 2, 30);
    bluePoint.position.set(-10, -5, 10);
    scene.add(bluePoint);

    const netGroup = new THREE.Group();
    scene.add(netGroup);

    // Network Layer Specifications
    const layers = [
      { name: 'Clinical Inputs', count: 8, x: -10, color: 0x38bdf8, baseNames: ['Prior Emergencies', 'HbA1c > 8.0%', 'Prior Inpatient', 'Hospital Stay', 'Polypharmacy', 'Serum Glucose', 'Insulin Titration', 'Nephropathy Comorbidity'] },
      { name: 'Feature Embeddings', count: 6, x: -3.5, color: 0x00f5d4 },
      { name: 'Ensemble Decision Layer', count: 5, x: 3.5, color: 0xa855f7 },
      { name: 'Readmission Output', count: 2, x: 10, color: 0xef4444, baseNames: ['<30-Day Readmit', 'Stable Discharge'] }
    ];

    const nodeMeshes = [];
    const layerNodes = [];

    // Create Nodes for each layer
    layers.forEach((layer, layerIdx) => {
      const currentLayerNodes = [];
      const spacingY = 1.8;
      const startY = ((layer.count - 1) * spacingY) / 2;

      for (let i = 0; i < layer.count; i++) {
        const y = startY - i * spacingY;
        const geo = new THREE.SphereGeometry(layerIdx === 3 ? 0.6 : 0.42, 16, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: layer.color,
          emissive: layer.color,
          emissiveIntensity: 0.6,
          roughness: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(layer.x, y, 0);

        const haloGeo = new THREE.SphereGeometry(layerIdx === 3 ? 0.9 : 0.65, 12, 12);
        const haloMat = new THREE.MeshBasicMaterial({ color: layer.color, wireframe: true, transparent: true, opacity: 0.3 });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        mesh.add(halo);

        mesh.userData = {
          layerName: layer.name,
          label: layer.baseNames ? layer.baseNames[i] : `Neuron L${layerIdx+1}-${i+1}`,
          color: layer.color
        };

        netGroup.add(mesh);
        nodeMeshes.push(mesh);
        currentLayerNodes.push(mesh);
      }
      layerNodes.push(currentLayerNodes);
    });

    // Create Synapse Connections between adjacent layers
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.35
    });

    const lineGeo = new THREE.BufferGeometry();
    const linePositions = [];

    for (let l = 0; l < layerNodes.length - 1; l++) {
      const fromLayer = layerNodes[l];
      const toLayer = layerNodes[l + 1];

      fromLayer.forEach((fromNode) => {
        toLayer.forEach((toNode) => {
          linePositions.push(
            fromNode.position.x, fromNode.position.y, fromNode.position.z,
            toNode.position.x, toNode.position.y, toNode.position.z
          );
        });
      });
    }

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const synapses = new THREE.LineSegments(lineGeo, lineMat);
    netGroup.add(synapses);

    // Animated Signal Pulses traversing through the network
    const pulseCount = 35;
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(pulseCount * 3);
    const pulseData = [];

    for (let i = 0; i < pulseCount; i++) {
      const startLayerIdx = Math.floor(Math.random() * (layerNodes.length - 1));
      const fromNode = layerNodes[startLayerIdx][Math.floor(Math.random() * layerNodes[startLayerIdx].length)];
      const toNode = layerNodes[startLayerIdx + 1][Math.floor(Math.random() * layerNodes[startLayerIdx + 1].length)];

      pulseData.push({
        from: fromNode.position,
        to: toNode.position,
        progress: Math.random(),
        speed: 0.015 + Math.random() * 0.02
      });
    }

    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    const pulseMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.22,
      transparent: true,
      opacity: 0.95
    });
    const signalParticles = new THREE.Points(pulseGeo, pulseMat);
    netGroup.add(signalParticles);

    // Mouse Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0;
    let rotX = 0;

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
        rotY += dx * 0.006;
        rotX = Math.max(-0.4, Math.min(0.4, rotX + dy * 0.005));
        prevMouse = { x: e.clientX, y: e.clientY };
      }

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        container.style.cursor = 'pointer';
      } else {
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
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        setSelectedNode(hits[0].object.userData);
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
      const t = clock.getElapsedTime();

      netGroup.rotation.y += (rotY - netGroup.rotation.y) * 0.08;
      netGroup.rotation.x += (rotX - netGroup.rotation.x) * 0.08;

      // Pulse nodes
      nodeMeshes.forEach((mesh, idx) => {
        const scale = 1.0 + Math.sin(t * 3.0 + idx) * 0.08;
        mesh.scale.set(scale, scale, scale);
      });

      // Update traveling signal pulses
      const posArray = pulseGeo.attributes.position.array;
      pulseData.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1.0) {
          p.progress = 0.0;
        }
        const curX = p.from.x + (p.to.x - p.from.x) * p.progress;
        const curY = p.from.y + (p.to.y - p.from.y) * p.progress;
        const curZ = p.from.z + (p.to.z - p.from.z) * p.progress;

        posArray[idx * 3] = curX;
        posArray[idx * 3 + 1] = curY;
        posArray[idx * 3 + 2] = curZ;
      });
      pulseGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

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
  }, [activeModel]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl glass-panel overflow-hidden border border-cyan-500/20 shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Header */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-1">
          <Cpu className="w-3.5 h-3.5" />
          3D AI Neural Decision Matrix
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          {activeModel} Decision Architecture
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          Clinical Input Features ➔ Feature Embeddings ➔ Ensemble Estimators ➔ Readmission Risk Probability
        </p>
      </div>

      {/* Performance Pill Top Right */}
      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 text-xs font-mono z-10 flex items-center gap-4">
        <div>
          <div className="text-slate-400 text-[10px]">ROC-AUC</div>
          <div className="text-base font-bold text-cyan-400">{metrics.roc_auc || 0.812}</div>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <div className="text-slate-400 text-[10px]">ACCURACY</div>
          <div className="text-base font-bold text-emerald-400">{metrics.accuracy || '68.4%'}</div>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <div className="text-slate-400 text-[10px]">F1-SCORE</div>
          <div className="text-base font-bold text-amber-400">{metrics.f1_score || '64.2%'}</div>
        </div>
      </div>

      {/* Selected Node HUD */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between shadow-2xl z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedNode.label}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  {selectedNode.layerName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic clinical weight: Active contributor to 30-day readmission decision trees.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Hint */}
      <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-mono pointer-events-none">
        [Click Nodes to Inspect Clinical Features • Drag to Pan]
      </div>
    </div>
  );
}
