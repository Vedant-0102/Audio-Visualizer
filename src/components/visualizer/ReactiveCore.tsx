import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ThemeType } from '../../store/store';
import { getBassLevel, getMidLevel, getTrebleLevel, getAverageLoudness } from '../../utils/audioProcessing';

type ReactiveCoreMaterial = THREE.MeshStandardMaterial & {
  userData: {
    time: number;
  };
};

interface ReactiveCoreProps {
  theme: ThemeType;
}

export const ReactiveCore: React.FC<ReactiveCoreProps> = ({ theme }) => {
  const { frequencyData, timeData, isPlaying } = useStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<ReactiveCoreMaterial>(null);
  
  // Set theme-based colors
  const getThemeColor = () => {
    switch (theme) {
      case 'cosmic': return new THREE.Color('#9333ea');
      case 'firestorm': return new THREE.Color('#f97316');
      case 'electric': return new THREE.Color('#06b6d4');
      case 'aurora': return new THREE.Color('#10b981');
      default: return new THREE.Color('#9333ea');
    }
  };
  
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current || !isPlaying) return;
    
    // Get audio levels
    const bassLevel = getBassLevel(frequencyData);
    const midLevel = getMidLevel(frequencyData);
    const trebleLevel = getTrebleLevel(frequencyData);
    const loudness = getAverageLoudness(frequencyData);
    
    // Scale with bass (breathing effect)
    const scaleFactor = 1 + bassLevel * 0.5;
    meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // Rotate based on mid frequencies
    meshRef.current.rotation.y += delta * (0.1 + midLevel * 0.3);
    meshRef.current.rotation.z += delta * 0.05 * midLevel;
    
    // Distort/morph based on treble
    if (materialRef.current) {
      materialRef.current.roughness = 0.5 - trebleLevel * 0.5;
      materialRef.current.metalness = 0.5 + trebleLevel * 0.4;
      materialRef.current.emissiveIntensity = 0.5 + loudness * 2;
      
      // Update time
      materialRef.current.userData.time += delta * (1 + bassLevel * 2);
      
      // Update color with slight variation
      const baseColor = getThemeColor();
      const hsl = { h: 0, s: 0, l: 0 };
      baseColor.getHSL(hsl);
      hsl.h += Math.sin(materialRef.current.userData.time * 0.1) * 0.02;
      hsl.s += trebleLevel * 0.1;
      baseColor.setHSL(hsl.h, hsl.s, hsl.l);
      
      materialRef.current.color.copy(baseColor);
      materialRef.current.emissive.copy(baseColor);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        color={getThemeColor()}
        emissive={getThemeColor()}
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.8}
        userData={{ time: 0 }}
      />
    </mesh>
  );
};