import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HolographicEarth } from "./HolographicEarth";
import * as THREE from "three";

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
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 2.5; // Slightly larger than Earth radius
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.3) * 0.5, // Add some vertical variation
          Math.sin(angle) * radius,
        ),
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const blueLineGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 2.7;
      points.push(
        new THREE.Vector3(
          Math.cos(angle + Math.PI * 0.5) * radius,
          Math.cos(angle * 0.4) * 0.3,
          Math.sin(angle + Math.PI * 0.5) * radius,
        ),
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const yellowLineGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 2.6;
      points.push(
        new THREE.Vector3(
          Math.cos(angle + Math.PI) * radius,
          Math.sin(angle * 0.2) * 0.7,
          Math.sin(angle + Math.PI) * radius,
        ),
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <>
      <group ref={redTrailRef}>
        <line>
          <bufferGeometry attach="geometry" {...redLineGeometry} />
          <lineBasicMaterial attach="material" color="#ff6b6b" />
        </line>
      </group>
      <group ref={blueTrailRef}>
        <line>
          <bufferGeometry attach="geometry" {...blueLineGeometry} />
          <lineBasicMaterial attach="material" color="#4ecdc4" />
        </line>
      </group>
      <group ref={yellowTrailRef}>
        <line>
          <bufferGeometry attach="geometry" {...yellowLineGeometry} />
          <lineBasicMaterial attach="material" color="#ffe66d" />
        </line>
      </group>
    </>
  );
};

const EarthScene = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <HolographicEarth />
          <DynamicLightTrails />
          <OrbitControls enableZoom={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export { EarthScene };
