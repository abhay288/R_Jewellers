"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, PresentationControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function DiamondMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Slow continuous rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.5} // XYZ rotation intensity
      floatIntensity={1.5} // Up/down float intensity
      floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* OctahedronGeometry gives a diamond-like shape */}
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#d4a373" // Rose gold / champagne tone
          metalness={1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
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
