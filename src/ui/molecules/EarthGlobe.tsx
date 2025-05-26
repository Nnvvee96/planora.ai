import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface EarthGlobeProps {
  className?: string;
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000812); // Dark blue-black background matching screenshot
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000812);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add subtle orbit controls (disabled zooming to keep it simple)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3; // Slower rotation for elegance
    controls.minPolarAngle = Math.PI * 0.2; // Limit rotation to show Earth at angle like in screenshot
    controls.maxPolarAngle = Math.PI * 0.8;
    
    // Create globe
    const radius = 2;
    
    // Create base sphere for the Earth
    const earthGeometry = new THREE.SphereGeometry(radius, 64, 64);
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x000812, // Deep blue-black
      transparent: true,
      opacity: 0.3,
    });
    const earthBase = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthBase);
    
    // Create outer glow effect
    const glowGeometry = new THREE.SphereGeometry(radius * 1.01, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ffff) },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.5 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          gl_FragColor = vec4(glowColor, intensity * 0.5);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Create the landmass outlines using the GeoJSON data of continents
    const continentsData = [
      // Africa outline coordinates (simplified)
      [
        [17, 3], [16, -4], [20, -20], [32, -35], [25, -35], [12, -30],
        [5, -15], [-10, 5], [-18, 15], [-15, 25], [0, 35], [15, 35], [30, 20], [17, 3]
      ],
      // Europe & Asia outline coordinates (simplified)
      [
        [35, 40], [50, 60], [100, 70], [140, 70], [150, 60], [130, 45],
        [145, 30], [110, 20], [90, 10], [80, 20], [60, 35], [35, 40]
      ],
      // North America outline coordinates (simplified)
      [
        [-70, 15], [-120, 30], [-130, 50], [-125, 70], [-90, 80], [-70, 60],
        [-50, 50], [-60, 30], [-70, 15]
      ],
      // South America outline coordinates (simplified)
      [
        [-70, 10], [-80, -10], [-70, -30], [-60, -55], [-40, -60], [-35, -35],
        [-50, -20], [-55, 0], [-70, 10]
      ],
      // Australia outline coordinates (simplified)
      [
        [115, -10], [130, -10], [150, -25], [145, -40], [115, -35], [110, -20], [115, -10]
      ]
    ];
    
    // Create the landmass outlines with enhanced brightness and precision
    continentsData.forEach(continent => {
      const points = [];
      continent.forEach(point => {
        // Convert from latitude/longitude to 3D coordinates
        const lat = point[1] * Math.PI / 180;
        const lon = point[0] * Math.PI / 180;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        points.push(new THREE.Vector3(x, y, z));
      });
      
      const continentGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const continentMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff, // Bright cyan color exactly like screenshot
        linewidth: 2,
        transparent: true,
        opacity: 0.9, // Higher opacity for more vibrant appearance
      });
      const continentLine = new THREE.Line(continentGeometry, continentMaterial);
      scene.add(continentLine);
    });
    
    // Create grid pattern for latitudes (horizontal lines)
    const latGridCount = 20;
    for (let i = 0; i < latGridCount; i++) {
      const phi = (Math.PI * i) / latGridCount;
      const gridRadius = radius * Math.sin(phi);
      
      // Create circle points manually
      const segments = 64;
      const points = [];
      for (let j = 0; j < segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          gridRadius * Math.cos(theta),
          0,
          gridRadius * Math.sin(theta)
        ));
      }
      // Close the loop
      points.push(points[0].clone());
      
      const gridGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const gridMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.05, // Very subtle
      });
      
      const grid = new THREE.Line(gridGeometry, gridMaterial);
      grid.rotation.x = Math.PI / 2;
      grid.position.y = radius * Math.cos(phi);
      scene.add(grid);
    }
    
    // Create dot matrix pattern - this is key to matching the screenshot
    const dotsGeometry = new THREE.BufferGeometry();
    const dotsPositions = [];
    const dotsColors = [];
    const dotsCount = 5000; // More dots for denser appearance
    
    for (let i = 0; i < dotsCount; i++) {
      // Use a more uniform distribution pattern for the dots
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      // Add some variation to dot sizes based on position
      dotsPositions.push(x, y, z);
      
      // Add color variation - some dots slightly brighter than others
      const brightness = 0.6 + Math.random() * 0.4;
      dotsColors.push(0, brightness, brightness); // RGB for cyan with varying brightness
    }
    
    dotsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dotsPositions, 3));
    dotsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dotsColors, 3));
    
    const dotsMaterial = new THREE.PointsMaterial({
      size: 0.025, // Smaller dots for finer appearance
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    
    const dots = new THREE.Points(dotsGeometry, dotsMaterial);
    scene.add(dots);
    
    // Create enhanced flight paths with gradients and pulses
    const createFlightPath = (startLat: number, startLon: number, endLat: number, endLon: number, color: number) => {
      // Convert lat/lon to radians
      const startLatRad = startLat * Math.PI / 180;
      const startLonRad = startLon * Math.PI / 180;
      const endLatRad = endLat * Math.PI / 180;
      const endLonRad = endLon * Math.PI / 180;
      
      // Convert to 3D coordinates
      const startX = radius * Math.cos(startLatRad) * Math.cos(startLonRad);
      const startY = radius * Math.sin(startLatRad);
      const startZ = radius * Math.cos(startLatRad) * Math.sin(startLonRad);
      
      const endX = radius * Math.cos(endLatRad) * Math.cos(endLonRad);
      const endY = radius * Math.sin(endLatRad);
      const endZ = radius * Math.cos(endLatRad) * Math.sin(endLonRad);
      
      // Create a curve for the path with higher arc for more dramatic effect
      const midPoint = new THREE.Vector3(
        (startX + endX) / 2,
        (startY + endY) / 2,
        (startZ + endZ) / 2
      );
      
      // Calculate distance for elevation
      const distance = Math.sqrt(
        (endX - startX) ** 2 + (endY - startY) ** 2 + (endZ - startZ) ** 2
      );
      
      // Higher elevation for longer distances - matches screenshot better
      const elevation = 0.2 + distance * 0.35;
      midPoint.normalize().multiplyScalar(radius + elevation);
      
      // Create a smoother curve with more points
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(startX, startY, startZ),
        midPoint,
        new THREE.Vector3(endX, endY, endZ)
      );
      
      // More points for smoother curve
      const points = curve.getPoints(100);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // Create a brighter, more vibrant path
      const lineMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.95, // More vibrant
        linewidth: 1.5, // Slightly thicker
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      
      // Add small dots at start and end points to highlight destinations
      const endpointGeometry = new THREE.SphereGeometry(0.03, 8, 8);
      const endpointMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9
      });
      
      const startPoint = new THREE.Mesh(endpointGeometry, endpointMaterial);
      startPoint.position.set(startX, startY, startZ);
      scene.add(startPoint);
      
      const endPoint = new THREE.Mesh(endpointGeometry, endpointMaterial);
      endPoint.position.set(endX, endY, endZ);
      scene.add(endPoint);
    };
    
    // Create flight paths with colors that match the screenshot better
    createFlightPath(35, 139, 37, -122, 0x00ffff); // Tokyo to San Francisco (cyan)
    createFlightPath(51, 0, 40, -74, 0x00ffff);    // London to New York (cyan)
    createFlightPath(1, 103, -33, 151, 0xff5500);  // Singapore to Sydney (orange)
    createFlightPath(19, 72, 25, 55, 0xff3300);    // Mumbai to Dubai (red-orange)
    createFlightPath(-15, -47, 40, -3, 0xff0099);  // Brazil to Spain (pink)
    
    // Add ambient light for basic illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update(); // Required for auto-rotation
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(animationId);
      scene.clear();
      controls.dispose();
    };
  }, []);
  
  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
};
