"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, PresentationControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

import { useMemo } from "react";

function DiamondMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Slow continuous rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  const diamondPoints = useMemo(() => {
    return [
      new THREE.Vector2(0, -0.8),    // culet (bottom)
      new THREE.Vector2(1, 0),       // girdle (widest point)
      new THREE.Vector2(0.55, 0.3),  // table edge (top)
      new THREE.Vector2(0, 0.3)      // table center
    ];
  }, []);

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.5} // XYZ rotation intensity
      floatIntensity={1.5} // Up/down float intensity
      floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* LatheGeometry with 16 segments creates a beautiful faceted diamond */}
        <latheGeometry args={[diamondPoints, 16]} />
        <meshPhysicalMaterial
          color="#d4a373" // Rose gold / champagne tone
          metalness={1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
          transmission={0.4} // Adds a subtle glassy/diamond transparency
          ior={2.4} // Diamond index of refraction
          thickness={1}
          flatShading={true}
        />
      </mesh>
    </Float>
  );
}

export function FloatingJewel() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        <PresentationControls
          global={false}
          snap={true}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <DiamondMesh />
        </PresentationControls>

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        
        {/* Realistic environment lighting for glass/diamond reflections */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
