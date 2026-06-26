import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  
  // Quantidade fixa. O Three.js lida bem com 1500 pontos em qualquer celular moderno.
  const count = 1500;

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
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      {/* depthWrite={false} resolve problemas de sobreposição transparente das partículas */}
      <pointsMaterial size={0.03} color="#10b981" sizeAttenuation transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

// Esfera com Material Holográfico Otimizado (Sem ruído pesado, apenas Fresnel)
function CoreSphere() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#10b981") }, // Esmeralda
      uColor2: { value: new THREE.Color("#06b6d4") }, // Ciano
      uColor3: { value: new THREE.Color("#8b5cf6") }, // Violeta
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        
        // Distorsão sutil baseada em Seno (MUITO mais leve que Simplex Noise para celulares)
        float distortion = sin(position.x * 3.0 + uTime) * sin(position.y * 3.0 + uTime * 0.8) * 0.15;
        vec3 newPos = position + normal * distortion;
        vPosition = (modelViewMatrix * vec4(newPos, 1.0)).xyz;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // Efeito Iridescente (Fresnel)
        vec3 viewDirection = normalize(-vPosition);
        float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);

        // Transição de cores
        float gradient = sin(vPosition.y * 2.0 + uTime * 0.5) * 0.5 + 0.5;
        vec3 color = mix(uColor1, uColor2, gradient);
        color = mix(color, uColor3, fresnel);

        // Brilho nas bordas
        float alpha = 0.5 + fresnel * 0.9;

        gl_FragColor = vec4(color, alpha);
      }
    `
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere args={[1.8, 64, 64]}> {/* Reduzi de 128 para 64 segmentos. Visualmente idêntico, mas 50% mais leve na GPU */}
        <shaderMaterial 
          ref={materialRef}
          attach="material" 
          {...shaderData}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Sphere>
    </Float>
  );
}

export default function HolographicSphere() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }} 
        dpr={[1, 1.5]} // Limita a resolução para manter FPS alto
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }} // Desliguei o antialiasing porque o shader esconde as arestas e dá um ganho massivo de FPS
      >
        <ambientLight intensity={0.2} />
        <CoreSphere />
        <ParticleField />
        <color attach="background" args={['#0a0a0f']} />
      </Canvas>
    </div>
  );
}