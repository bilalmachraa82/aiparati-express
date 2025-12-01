'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

function SimpleCrystal() {
  const meshRef = useRef<Mesh>(null!);

  // The autoRotate on OrbitControls handles the rotation, so useFrame is not strictly needed but can be used for more complex animations later.
  // useFrame((state, delta) => {
  //   if (meshRef.current) {
  //     // meshRef.current.rotation.y += delta * 0.2;
  //   }
  // });

  return (
    <mesh ref={meshRef} scale={1.2}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial 
        color="#3B82F6" // A simple, solid blue
        transparent 
        opacity={0.9} 
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

export function Hero3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        
        <SimpleCrystal />
        
        <OrbitControls 
          enabled={false} // Disables manual user interaction
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.75}
        />
      </Canvas>
    </div>
  );
}
