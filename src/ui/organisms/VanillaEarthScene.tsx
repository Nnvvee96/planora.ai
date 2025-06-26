import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const VanillaEarthScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    earthGroup?: THREE.Group;
    continentParticles?: THREE.Points;
    oceanParticles?: THREE.Points;
    animationId?: number;
  }>({});

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // Store references
    sceneRef.current = { scene, camera, renderer };

    // Configure renderer
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create Earth group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    sceneRef.current.earthGroup = earthGroup;

    // Detailed continent shapes (same as original)
    const continentShapes = {
      northAmerica: [
        [71, -156], [70, -165], [65, -168], [60, -165], [55, -160], [60, -141], [69, -141], [71, -156],
        [60, -141], [55, -130], [54, -132], [51, -128], [49, -125], [48, -125], [46, -124],
        [42, -124], [40, -124], [36, -121], [34, -120], [32, -117], [32, -115],
        [31, -115], [28, -114], [24, -110], [20, -105], [16, -95], [18, -88], [21, -87],
        [26, -82], [28, -83], [30, -88], [30, -94], [29, -95], [26, -97], [22, -97], [18, -95],
        [21, -87], [25, -80], [27, -80], [31, -81], [33, -79], [35, -76],
        [36, -76], [39, -74], [41, -70], [43, -69], [45, -67], [47, -67],
        [50, -67], [55, -67], [60, -67], [65, -67], [70, -67], [75, -68], [78, -75],
        [82, -85], [83, -110], [80, -125], [75, -140], [71, -156]
      ],
      southAmerica: [
        [12, -61], [11, -64], [10, -67], [8, -70], [6, -68], [8, -61], [10, -60],
        [8, -61], [6, -55], [4, -52], [2, -52], [-2, -50], [-5, -35],
        [-8, -35], [-12, -37], [-16, -39], [-20, -40], [-23, -43], [-26, -48], [-30, -50],
        [-33, -53], [-35, -56], [-34, -58], [-32, -60], 
        [-35, -58], [-38, -62], [-42, -65], [-46, -67], [-50, -69], [-52, -69], [-55, -67],
        [-55, -70], [-52, -70], [-48, -75], [-45, -73], [-40, -73], [-35, -71], [-30, -71],
        [-25, -70], [-20, -70], [-15, -75], [-10, -78], [-5, -81], [-3, -80],
        [-1, -79], [1, -79], [3, -78], [6, -77], [8, -77], [10, -75], [11, -72], [12, -70],
        [8, -77], [6, -77], [4, -77], [1, -78], [4, -75], [8, -75], [10, -72], [12, -61]
      ],
      africa: [
        [37, -9], [35, -6], [32, -6], [31, 0], [30, 10], [31, 25], [30, 32], [22, 32],
        [22, 38], [15, 43], [12, 43], [11, 51], [8, 47], [3, 42], [-1, 42],
        [-4, 40], [-8, 40], [-12, 40], [-17, 36], [-26, 33], [-29, 29], [-31, 29],
        [-35, 20], [-34, 18], [-29, 17], [-26, 15], [-22, 17], [-18, 12], [-12, 12],
        [-8, 9], [-4, 9], [0, 9], [4, 6], [6, 3], [10, 2], [13, -2], [15, -8], [18, -16],
        [20, -17], [24, -17], [28, -12], [31, -9], [35, -6], [37, -9]
      ],
      europe: [
        [71, 31], [70, 29], [69, 18], [68, 15], [66, 12], [64, 12], [62, 5], [60, 5],
        [60, 11], [62, 15], [65, 24], [68, 29], [70, 29], [71, 31],
        [60, 20], [58, 22], [56, 21], [54, 20], [55, 12], [57, 10], [60, 11],
        [54, 20], [52, 23], [50, 30], [48, 35], [46, 36], [44, 29], [45, 20],
        [46, 15], [44, 16], [42, 20], [40, 20], [39, 23], [37, 23], [36, 28], [37, 12],
        [39, 9], [40, 8], [42, 3], [43, 7], [44, 7], [46, 6], [47, 2], [48, 2],
        [49, -2], [50, -4], [51, 2], [51, 3], [54, 9], [55, 12], [60, 5]
      ],
      asia: [
        [77, 104], [75, 80], [73, 70], [70, 60], [68, 50], [70, 30], [68, 20], [65, 24],
        [60, 30], [55, 35], [50, 40], [45, 40], [42, 48], [40, 50], [37, 55], [35, 60],
        [33, 48], [30, 48], [25, 50], [25, 57], [20, 57], [15, 57], [12, 60], [10, 60],
        [8, 68], [8, 77], [12, 80], [18, 82], [23, 89], [28, 89], [30, 85], [32, 78],
        [25, 95], [20, 100], [15, 105], [10, 105], [5, 110], [1, 104], [-8, 115], [-10, 125],
        [-8, 140], [-5, 140], [0, 141], [5, 135], [10, 130], [15, 125], [20, 121],
        [25, 121], [30, 121], [35, 125], [40, 125], [45, 130], [50, 135], [55, 140],
        [60, 150], [65, 160], [70, 170], [75, 170], [77, 160], [77, 140], [77, 104]
      ],
      australia: [
        [-10, 113], [-12, 130], [-14, 136], [-12, 142], [-10, 145], [-12, 148],
        [-16, 145], [-20, 149], [-25, 153], [-28, 153], [-31, 153], [-35, 150], [-37, 148],
        [-39, 146], [-39, 140], [-38, 135], [-35, 129], [-32, 125], [-31, 115],
        [-29, 114], [-26, 113], [-20, 113], [-16, 114], [-12, 115], [-10, 113]
      ]
    };

    // Point in polygon algorithm
    const isPointInPolygon = (lat: number, lng: number, polygon: number[][]) => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        
        if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      return inside;
    };

    // Function to check if a point is inside a continent
    const isInsideContinent = (lat: number, lng: number) => {
      for (const shape of Object.values(continentShapes)) {
        if (isPointInPolygon(lat, lng, shape)) {
          return true;
        }
      }
      return false;
    };

    // Create dark Earth core
    const coreGeometry = new THREE.SphereGeometry(1.98, 64, 64);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x000022,
      transparent: true,
      opacity: 0.3
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    earthGroup.add(core);

    // Create continent particles
    const continentGeometry = new THREE.BufferGeometry();
    const continentPositions: number[] = [];
    const continentColors: number[] = [];
    
    for (let lat = -90; lat <= 90; lat += 1.2) {
      for (let lng = -180; lng <= 180; lng += 1.2) {
        if (isInsideContinent(lat, lng)) {
          for (let i = 0; i < 6; i++) {
            const offsetLat = lat + (Math.random() - 0.5) * 1.2;
            const offsetLng = lng + (Math.random() - 0.5) * 1.2;
            
            const phi = (90 - offsetLat) * (Math.PI / 180);
            const theta = (offsetLng + 180) * (Math.PI / 180);
            const radius = 2.01 + Math.random() * 0.02;
            
            continentPositions.push(
              -radius * Math.sin(phi) * Math.cos(theta),
              radius * Math.cos(phi),
              radius * Math.sin(phi) * Math.sin(theta)
            );
            
            const intensity = 0.8 + Math.random() * 0.2;
            continentColors.push(0, intensity, 1);
          }
        }
      }
    }
    
    continentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(continentPositions, 3));
    continentGeometry.setAttribute('color', new THREE.Float32BufferAttribute(continentColors, 3));
    
    const continentMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.01,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });
    
    const continentParticles = new THREE.Points(continentGeometry, continentMaterial);
    earthGroup.add(continentParticles);
    sceneRef.current.continentParticles = continentParticles;

    // Create ocean particles
    const oceanGeometry = new THREE.BufferGeometry();
    const oceanPositions: number[] = [];
    const oceanColors: number[] = [];
    
    for (let lat = -90; lat <= 90; lat += 1.5) {
      for (let lng = -180; lng <= 180; lng += 1.5) {
        if (!isInsideContinent(lat, lng)) {
          for (let i = 0; i < 3; i++) {
            const offsetLat = lat + (Math.random() - 0.5) * 1.5;
            const offsetLng = lng + (Math.random() - 0.5) * 1.5;
            
            const phi = (90 - offsetLat) * (Math.PI / 180);
            const theta = (offsetLng + 180) * (Math.PI / 180);
            const radius = 2.005 + Math.random() * 0.015;
            
            oceanPositions.push(
              -radius * Math.sin(phi) * Math.cos(theta),
              radius * Math.cos(phi),
              radius * Math.sin(phi) * Math.sin(theta)
            );
            
            const intensity = 0.2 + Math.random() * 0.4;
            oceanColors.push(0, intensity * 0.5, intensity * 0.8);
          }
        }
      }
    }
    
    oceanGeometry.setAttribute('position', new THREE.Float32BufferAttribute(oceanPositions, 3));
    oceanGeometry.setAttribute('color', new THREE.Float32BufferAttribute(oceanColors, 3));
    
    const oceanMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.008,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    const oceanParticles = new THREE.Points(oceanGeometry, oceanMaterial);
    earthGroup.add(oceanParticles);
    sceneRef.current.oceanParticles = oceanParticles;

    // Create continent outlines
    Object.values(continentShapes).forEach((coords) => {
      const points: THREE.Vector3[] = [];
      coords.forEach(([lat, lng]) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const radius = 2.025;
        points.push(new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ));
      });
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
      });
      const line = new THREE.LineLoop(geometry, material);
      earthGroup.add(line);
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    
    scene.add(ambientLight);
    scene.add(pointLight);

    // Position camera
    camera.position.z = 5;

    // Create orbital trails
    const createOrbitTrail = (radius: number, color: number, speed: number) => {
      const points = [];
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.3) * 0.5,
          Math.sin(angle) * radius
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.6 
      });
      const line = new THREE.Line(geometry, material);
      
      scene.add(line);
      return { line, speed };
    };

    const trails = [
      createOrbitTrail(2.5, 0xff6b6b, 0.5),
      createOrbitTrail(2.7, 0x4ecdc4, -0.3),
      createOrbitTrail(2.6, 0xffe66d, 0.7),
    ];

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      sceneRef.current.animationId = animationId;

      const time = Date.now() * 0.001;

      // Rotate Earth group (slow rotation like original)
      if (earthGroup) {
        earthGroup.rotation.y += 0.002;
      }

      // Animate particle opacity
      if (continentParticles) {
        (continentParticles.material as THREE.PointsMaterial).opacity = 0.9 + Math.sin(time * 1.5) * 0.1;
      }
      
      if (oceanParticles) {
        (oceanParticles.material as THREE.PointsMaterial).opacity = 0.6 + Math.sin(time * 2.0) * 0.2;
      }

      // Animate trails
      trails.forEach(({ line, speed }) => {
        line.rotation.y = time * speed;
        line.rotation.x = Math.sin(time * 0.5) * 0.1;
      });

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      
      if (sceneRef.current.renderer && mountRef.current) {
        mountRef.current.removeChild(sceneRef.current.renderer.domElement);
        sceneRef.current.renderer.dispose();
      }
      
      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    />
  );
};

export { VanillaEarthScene }; 