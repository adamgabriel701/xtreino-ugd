import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 2000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15; // z
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        {/* CORREÇÃO: O R3F mais novo exige que o array seja passado dentro de 'args' */}
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#10b981" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function CoreSphere() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1.5, 100, 100]} scale={1}>
        <MeshDistortMaterial
          color="#10b981"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive="#10b981"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
}

export default function HolographicSphere() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <CoreSphere />
        <ParticleField />
        <color attach="background" args={['#0a0a0f']} />
      </Canvas>
    </div>
  );
}