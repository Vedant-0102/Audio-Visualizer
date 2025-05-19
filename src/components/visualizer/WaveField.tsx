import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ThemeType } from '../../store/store';
import { getMidLevel, getBeatDetection } from '../../utils/audioProcessing';

interface WaveFieldProps {
  theme: ThemeType;
}

export const WaveField: React.FC<WaveFieldProps> = ({ theme }) => {
  const { frequencyData, timeData, isPlaying } = useStore();
  const groupRef = useRef<THREE.Group>(null);
  
  // Create wave rings
  const ringCount = 5;
  const rings = useMemo(() => {
    return Array.from({ length: ringCount }).map((_, i) => ({
      radius: 1.5 + i * 0.8,
      segments: 64,
      tubeRadius: 0.02 + (i * 0.01),
      color: getThemeColor(theme, i / ringCount),
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, [theme]);
  
  function getThemeColor(theme: ThemeType, offset: number = 0): THREE.Color {
    let color: THREE.Color;
    
    switch (theme) {
      case 'cosmic':
        color = new THREE.Color('#9333ea');
        break;
      case 'firestorm':
        color = new THREE.Color('#f97316');
        break;
      case 'electric':
        color = new THREE.Color('#06b6d4');
        break;
      case 'aurora':
        color = new THREE.Color('#10b981');
        break;
      default:
        color = new THREE.Color('#9333ea');
    }
    
    // Adjust color for each ring
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    hsl.h += offset * 0.1;
    hsl.s -= offset * 0.2;
    hsl.l += offset * 0.2;
    color.setHSL(hsl.h, hsl.s, hsl.l);
    
    return color;
  }
  
  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;
    
    const midLevel = getMidLevel(frequencyData);
    const beatDetected = getBeatDetection(timeData);
    
    // Rotate the entire wave field
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    groupRef.current.rotation.z += delta * 0.05;
    
    // Update each ring
    groupRef.current.children.forEach((ring, i) => {
      if (ring instanceof THREE.Mesh && ring.geometry instanceof THREE.TorusGeometry) {
        // Calculate wave
        const ringObj = rings[i];
        ringObj.phase += delta * ringObj.speed * (1 + midLevel);
        
        // On beat, make the rings pulse
        if (beatDetected) {
          ring.scale.set(1.1, 1.1, 1.1);
        } else {
          ring.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
        
        // Rotate each ring individually
        ring.rotation.z += delta * 0.1 * (i + 1) * (0.5 + midLevel);
      }
    });
  });
  
  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, ring.phase]}>
          <torusGeometry args={[ring.radius, ring.tubeRadius, 16, ring.segments]} />
          <meshStandardMaterial 
            color={ring.color} 
            emissive={ring.color}
            emissiveIntensity={0.5}
            roughness={0.4}
            metalness={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};