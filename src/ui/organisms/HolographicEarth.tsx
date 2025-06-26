import React, { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HolographicEarth = () => {
  const earthRef = useRef<THREE.Group>(null);
  const continentParticlesRef = useRef<THREE.Points>(null);
  const oceanParticlesRef = useRef<THREE.Points>(null);

  // Much more detailed and accurate continent shapes based on real geographical coordinates
  const continentShapes = useMemo(() => {
    return {
      northAmerica: [
        // Alaska
        [71, -156],
        [70, -165],
        [65, -168],
        [60, -165],
        [55, -160],
        [60, -141],
        [69, -141],
        [71, -156],
        // Western Canada coast
        [60, -141],
        [55, -130],
        [54, -132],
        [51, -128],
        [49, -125],
        [48, -125],
        [46, -124],
        // US West coast
        [42, -124],
        [40, -124],
        [36, -121],
        [34, -120],
        [32, -117],
        [32, -115],
        // Mexico West coast
        [31, -115],
        [28, -114],
        [24, -110],
        [20, -105],
        [16, -95],
        [18, -88],
        [21, -87],
        // Gulf of Mexico
        [26, -82],
        [28, -83],
        [30, -88],
        [30, -94],
        [29, -95],
        [26, -97],
        [22, -97],
        [18, -95],
        // Mexico East coast
        [21, -87],
        [25, -80],
        [27, -80],
        [31, -81],
        [33, -79],
        [35, -76],
        // US East coast
        [36, -76],
        [39, -74],
        [41, -70],
        [43, -69],
        [45, -67],
        [47, -67],
        // Eastern Canada
        [50, -67],
        [55, -67],
        [60, -67],
        [65, -67],
        [70, -67],
        [75, -68],
        [78, -75],
        // Arctic islands and back to Alaska
        [82, -85],
        [83, -110],
        [80, -125],
        [75, -140],
        [71, -156],
      ],

      southAmerica: [
        // Colombia/Venezuela north coast
        [12, -61],
        [11, -64],
        [10, -67],
        [8, -70],
        [6, -68],
        [8, -61],
        [10, -60],
        // Guyana/Suriname/French Guiana
        [8, -61],
        [6, -55],
        [4, -52],
        [2, -52],
        [-2, -50],
        [-5, -35],
        // Brazil east coast
        [-8, -35],
        [-12, -37],
        [-16, -39],
        [-20, -40],
        [-23, -43],
        [-26, -48],
        [-30, -50],
        // Southern Brazil/Uruguay
        [-33, -53],
        [-35, -56],
        [-34, -58],
        [-32, -60],
        // Argentina
        [-35, -58],
        [-38, -62],
        [-42, -65],
        [-46, -67],
        [-50, -69],
        [-52, -69],
        [-55, -67],
        // Chile (very narrow, going north)
        [-55, -70],
        [-52, -70],
        [-48, -75],
        [-45, -73],
        [-40, -73],
        [-35, -71],
        [-30, -71],
        [-25, -70],
        [-20, -70],
        [-15, -75],
        [-10, -78],
        [-5, -81],
        [-3, -80],
        // Peru coast
        [-1, -79],
        [1, -79],
        [3, -78],
        [6, -77],
        [8, -77],
        [10, -75],
        [11, -72],
        [12, -70],
        // Colombia west coast
        [8, -77],
        [6, -77],
        [4, -77],
        [1, -78],
        [4, -75],
        [8, -75],
        [10, -72],
        [12, -61],
      ],

      africa: [
        // North Africa - Morocco to Egypt
        [37, -9],
        [35, -6],
        [32, -6],
        [31, 0],
        [30, 10],
        [31, 25],
        [30, 32],
        [22, 32],
        // Sudan/Ethiopia
        [22, 38],
        [15, 43],
        [12, 43],
        [11, 51],
        [8, 47],
        [3, 42],
        [-1, 42],
        // East Africa coast
        [-4, 40],
        [-8, 40],
        [-12, 40],
        [-17, 36],
        [-26, 33],
        [-29, 29],
        [-31, 29],
        // South Africa
        [-35, 20],
        [-34, 18],
        [-29, 17],
        [-26, 15],
        [-22, 17],
        [-18, 12],
        [-12, 12],
        // West Africa coast
        [-8, 9],
        [-4, 9],
        [0, 9],
        [4, 6],
        [6, 3],
        [10, 2],
        [13, -2],
        [15, -8],
        [18, -16],
        [20, -17],
        [24, -17],
        [28, -12],
        [31, -9],
        [35, -6],
        [37, -9],
      ],

      europe: [
        // Scandinavia - Norway
        [71, 31],
        [70, 29],
        [69, 18],
        [68, 15],
        [66, 12],
        [64, 12],
        [62, 5],
        [60, 5],
        // Sweden/Finland
        [60, 11],
        [62, 15],
        [65, 24],
        [68, 29],
        [70, 29],
        [71, 31],
        // Baltic countries
        [60, 20],
        [58, 22],
        [56, 21],
        [54, 20],
        [55, 12],
        [57, 10],
        [60, 11],
        // Eastern Europe
        [54, 20],
        [52, 23],
        [50, 30],
        [48, 35],
        [46, 36],
        [44, 29],
        [45, 20],
        // Balkans
        [46, 15],
        [44, 16],
        [42, 20],
        [40, 20],
        [39, 23],
        [37, 23],
        [36, 28],
        [37, 12],
        // Mediterranean countries
        [39, 9],
        [40, 8],
        [42, 3],
        [43, 7],
        [44, 7],
        [46, 6],
        [47, 2],
        [48, 2],
        // Western Europe
        [49, -2],
        [50, -4],
        [51, 2],
        [51, 3],
        [54, 9],
        [55, 12],
        [60, 5],
      ],

      asia: [
        // Siberia
        [77, 104],
        [75, 80],
        [73, 70],
        [70, 60],
        [68, 50],
        [70, 30],
        [68, 20],
        [65, 24],
        // Central Asia
        [60, 30],
        [55, 35],
        [50, 40],
        [45, 40],
        [42, 48],
        [40, 50],
        [37, 55],
        [35, 60],
        // Middle East
        [33, 48],
        [30, 48],
        [25, 50],
        [25, 57],
        [20, 57],
        [15, 57],
        [12, 60],
        [10, 60],
        // India
        [8, 68],
        [8, 77],
        [12, 80],
        [18, 82],
        [23, 89],
        [28, 89],
        [30, 85],
        [32, 78],
        // Southeast Asia
        [25, 95],
        [20, 100],
        [15, 105],
        [10, 105],
        [5, 110],
        [1, 104],
        [-8, 115],
        [-10, 125],
        // Indonesia
        [-8, 140],
        [-5, 140],
        [0, 141],
        [5, 135],
        [10, 130],
        [15, 125],
        [20, 121],
        // East Asia
        [25, 121],
        [30, 121],
        [35, 125],
        [40, 125],
        [45, 130],
        [50, 135],
        [55, 140],
        [60, 150],
        [65, 160],
        [70, 170],
        [75, 170],
        [77, 160],
        [77, 140],
        [77, 104],
      ],

      australia: [
        // Northern Australia
        [-10, 113],
        [-12, 130],
        [-14, 136],
        [-12, 142],
        [-10, 145],
        [-12, 148],
        // Eastern Australia
        [-16, 145],
        [-20, 149],
        [-25, 153],
        [-28, 153],
        [-31, 153],
        [-35, 150],
        [-37, 148],
        // Southern Australia
        [-39, 146],
        [-39, 140],
        [-38, 135],
        [-35, 129],
        [-32, 125],
        [-31, 115],
        // Western Australia
        [-29, 114],
        [-26, 113],
        [-20, 113],
        [-16, 114],
        [-12, 115],
        [-10, 113],
      ],
    };
  }, []);

  // Function to check if a point is inside a continent
  const isInsideContinent = useCallback(
    (lat: number, lng: number) => {
      for (const shape of Object.values(continentShapes)) {
        if (isPointInPolygon(lat, lng, shape)) {
          return true;
        }
      }
      return false;
    },
    [continentShapes],
  );

  // Point in polygon algorithm
  const isPointInPolygon = (lat: number, lng: number, polygon: number[][]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      if (
        yi > lng !== yj > lng &&
        lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Create continent particles
  const continentParticles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    // Generate particles for continent areas
    for (let lat = -90; lat <= 90; lat += 1.2) {
      for (let lng = -180; lng <= 180; lng += 1.2) {
        if (isInsideContinent(lat, lng)) {
          // Add multiple particles per grid cell for density
          for (let i = 0; i < 6; i++) {
            const offsetLat = lat + (Math.random() - 0.5) * 1.2;
            const offsetLng = lng + (Math.random() - 0.5) * 1.2;

            const phi = (90 - offsetLat) * (Math.PI / 180);
            const theta = (offsetLng + 180) * (Math.PI / 180);
            const radius = 2.01 + Math.random() * 0.02;

            positions.push(
              -radius * Math.sin(phi) * Math.cos(theta),
              radius * Math.cos(phi),
              radius * Math.sin(phi) * Math.sin(theta),
            );

            // Continent colors - bright cyan/blue
            const intensity = 0.8 + Math.random() * 0.2;
            colors.push(0, intensity, 1);
          }
        }
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [isInsideContinent]);

  // Create ocean particles
  const oceanParticles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    // Generate particles for ocean areas
    for (let lat = -90; lat <= 90; lat += 1.5) {
      for (let lng = -180; lng <= 180; lng += 1.5) {
        if (!isInsideContinent(lat, lng)) {
          // Add particles for ocean
          for (let i = 0; i < 3; i++) {
            const offsetLat = lat + (Math.random() - 0.5) * 1.5;
            const offsetLng = lng + (Math.random() - 0.5) * 1.5;

            const phi = (90 - offsetLat) * (Math.PI / 180);
            const theta = (offsetLng + 180) * (Math.PI / 180);
            const radius = 2.005 + Math.random() * 0.015;

            positions.push(
              -radius * Math.sin(phi) * Math.cos(theta),
              radius * Math.cos(phi),
              radius * Math.sin(phi) * Math.sin(theta),
            );

            // Ocean colors - darker blue with glow
            const intensity = 0.2 + Math.random() * 0.4;
            colors.push(0, intensity * 0.5, intensity * 0.8);
          }
        }
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [isInsideContinent]);

  // Create continent outlines
  const continentOutlines = useMemo(() => {
    const outlines: THREE.Line[] = [];

    Object.values(continentShapes).forEach((coords, _index) => {
      const points: THREE.Vector3[] = [];
      coords.forEach(([lat, lng]) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const radius = 2.025;
        points.push(
          new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta),
          ),
        );
      });

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
      });
      const line = new THREE.LineLoop(geometry, material);
      outlines.push(line);
    });

    return outlines;
  }, [continentShapes]);

  // Animation
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }

    if (continentParticlesRef.current) {
      const material = continentParticlesRef.current
        .material as THREE.PointsMaterial;
      material.opacity = 0.9 + Math.sin(time * 1.5) * 0.1;
    }

    if (oceanParticlesRef.current) {
      const material = oceanParticlesRef.current
        .material as THREE.PointsMaterial;
      material.opacity = 0.6 + Math.sin(time * 2.0) * 0.2;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Dark Earth core */}
      <mesh>
        <sphereGeometry args={[1.98, 64, 64]} />
        <meshBasicMaterial color="#000022" transparent opacity={0.3} />
      </mesh>

      {/* Ocean particles */}
      <points ref={oceanParticlesRef} geometry={oceanParticles}>
        <pointsMaterial
          vertexColors
          size={0.008}
          transparent
          opacity={0.6}
          sizeAttenuation={true}
        />
      </points>

      {/* Continent particles */}
      <points ref={continentParticlesRef} geometry={continentParticles}>
        <pointsMaterial
          vertexColors
          size={0.01}
          transparent
          opacity={0.9}
          sizeAttenuation={true}
        />
      </points>

      {/* Continent outlines */}
      <group>
        {continentOutlines.map((line, index) => (
          <primitive key={`continent-${index}`} object={line} />
        ))}
      </group>
    </group>
  );
};

export { HolographicEarth };
