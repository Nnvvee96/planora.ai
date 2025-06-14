import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import HolographicEarth from './HolographicEarth';
import * as THREE from 'three';

const PLANE_ICON_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Airplane_icon.svg/128px-Airplane_icon.svg.png";

/** Overlays an SVG plane on top of the scene, smoothly animating its horizontal position */
const AirplaneOverlay: React.FC = () => {
  const [position, setPosition] = useState(-120);
  const requestRef = useRef<number>();

  useEffect(() => {
    const move = () => {
      setPosition((prev) => {
        let next = prev + 2;
        if (next > window.innerWidth) next = -120;
        return next;
      });
      requestRef.current = requestAnimationFrame(move);
    };
    requestRef.current = requestAnimationFrame(move);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return (
    <img
      src={PLANE_ICON_URL}
      alt="Airplane"
      style={{
        position: "absolute",
        width: 100,
        top: "50%",
        left: position,
        transform: "translateY(-50%)",
        zIndex: 30,
        pointerEvents: "none",
        transition: "transform 0.2s ease",
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.32))",
      }}
      draggable={false}
    />
  );
};

const DynamicLightTrails = () => {
  const redTrailRef = useRef<THREE.Group>(null);
  const blueTrailRef = useRef<THREE.Group>(null);
  const yellowTrailRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Rotate each line segment around the Earth at different speeds
    if (redTrailRef.current) {
      redTrailRef.current.rotation.y = time * 0.5;
      redTrailRef.current.rotation.x = 0.3; // Slight tilt
    }
    
    if (blueTrailRef.current) {
      blueTrailRef.current.rotation.y = -time * 0.3;
      blueTrailRef.current.rotation.z = 0.2; // Different tilt
    }
    
    if (yellowTrailRef.current) {
      yellowTrailRef.current.rotation.y = time * 0.7;
      yellowTrailRef.current.rotation.x = -0.4; // Another tilt
      yellowTrailRef.current.rotation.z = 0.1;
    }
  });

  // Create line geometries and materials
  const redLineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 2.2;
    const length = 0.4;
    const endAngle = length / radius;
    
    for (let i = 0; i <= 20; i++) {
      const angle = (endAngle * i) / 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const blueLineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 2.4;
    const length = 0.35;
    const endAngle = length / radius;
    
    for (let i = 0; i <= 20; i++) {
      const angle = (endAngle * i) / 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const yellowLineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 2.6;
    const length = 0.45;
    const endAngle = length / radius;
    
    for (let i = 0; i <= 20; i++) {
      const angle = (endAngle * i) / 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const redLineMaterial = useMemo(() => 
    new THREE.LineBasicMaterial({
      color: '#ff4444',
      transparent: true,
      opacity: 0.9,
      linewidth: 3
    }), []
  );

  const blueLineMaterial = useMemo(() => 
    new THREE.LineBasicMaterial({
      color: '#4466ff',
      transparent: true,
      opacity: 0.8,
      linewidth: 3
    }), []
  );

  const yellowLineMaterial = useMemo(() => 
    new THREE.LineBasicMaterial({
      color: '#ffaa44',
      transparent: true,
      opacity: 0.85,
      linewidth: 3
    }), []
  );

  const redLine = useMemo(() => new THREE.Line(redLineGeometry, redLineMaterial), [redLineGeometry, redLineMaterial]);
  const blueLine = useMemo(() => new THREE.Line(blueLineGeometry, blueLineMaterial), [blueLineGeometry, blueLineMaterial]);
  const yellowLine = useMemo(() => new THREE.Line(yellowLineGeometry, yellowLineMaterial), [yellowLineGeometry, yellowLineMaterial]);

  return (
    <>
      {/* Red orbital line segment */}
      <group ref={redTrailRef}>
        <primitive object={redLine} />
        <pointLight 
          position={[2.2, 0, 0]} 
          intensity={0.5} 
          color="#ff4444"
          distance={3}
          decay={1}
        />
      </group>

      {/* Blue orbital line segment */}
      <group ref={blueTrailRef}>
        <primitive object={blueLine} />
        <pointLight 
          position={[2.4, 0, 0]} 
          intensity={0.4} 
          color="#4466ff"
          distance={3}
          decay={1}
        />
      </group>

      {/* Yellow orbital line segment */}
      <group ref={yellowTrailRef}>
        <primitive object={yellowLine} />
        <pointLight 
          position={[2.6, 0, 0]} 
          intensity={0.45} 
          color="#ffaa44"
          distance={3}
          decay={1}
        />
      </group>
    </>
  );
};

const EarthScene = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        style={{ background: 'transparent' }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        <ambientLight intensity={0.2} color="#003366" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          color="#ffffff"
          castShadow
        />
        <DynamicLightTrails />
        {/* Holographic Earth */}
        <Suspense fallback={null}>
          <HolographicEarth />
        </Suspense>
        {/* Add the TRUE 3D code-generated airplane */}
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={4}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>

      {/* (Optional) Remove the AirplaneOverlay. If you only want the 3D airplane, comment out or remove the line below */}
      {/* <AirplaneOverlay /> */}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-cyan-400/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10" />
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.03) 2px,
                  rgba(0, 255, 255, 0.03) 4px
                )
              `,
              animation: 'scan 3s linear infinite'
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default EarthScene; 