import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useStore } from '../store/store';
import { ReactiveCore } from './visualizer/ReactiveCore';
import { WaveField } from './visualizer/WaveField';
import { Particles } from './visualizer/Particles';
import { BackgroundEffect } from './visualizer/BackgroundEffect';

export const VisualizerScene: React.FC = () => {
  const { audioFile, isPlaying, updateAnalyser, theme } = useStore();
  const orbitRef = useRef<any>(null);
  
  // Run analyzer updates in animation frame
  useFrame(() => {
    if (isPlaying) {
      updateAnalyser();
    }
    
    // Slow rotation when idle
    if (orbitRef.current && !audioFile) {
      orbitRef.current.autoRotate = true;
      orbitRef.current.autoRotateSpeed = 0.5;
    } else if (orbitRef.current) {
      orbitRef.current.autoRotate = false;
    }
  });
  
  // Set theme-based colors and lighting
  const getThemeSettings = () => {
    switch (theme) {
      case 'cosmic':
        return {
          ambient: 0x330066,
          coreColor: '#9333ea',
          particleColor: '#d8b4fe',
          intensity: 1.0,
        };
      case 'firestorm':
        return {
          ambient: 0x330000,
          coreColor: '#f97316',
          particleColor: '#fed7aa',
          intensity: 1.2,
        };
      case 'electric':
        return {
          ambient: 0x001a33,
          coreColor: '#06b6d4',
          particleColor: '#a5f3fc',
          intensity: 1.1,
        };
      case 'aurora':
        return {
          ambient: 0x002211,
          coreColor: '#10b981',
          particleColor: '#a7f3d0',
          intensity: 0.9,
        };
      default:
        return {
          ambient: 0x330066,
          coreColor: '#9333ea',
          particleColor: '#d8b4fe',
          intensity: 1.0,
        };
    }
  };
  
  const themeSettings = getThemeSettings();
  
  return (
    <>
      {/* Camera Controls */}
      <OrbitControls 
        ref={orbitRef} 
        enableDamping 
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={3}
        maxDistance={20}
      />
      
      {/* Ambient Scene Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={themeSettings.intensity * 0.5} 
        color={themeSettings.coreColor} 
      />
      
      {/* Star background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0.5}
        fade 
      />
      
      {/* Background glow/effects */}
      <BackgroundEffect theme={theme} />
      
      {/* Main visualization components */}
      {audioFile && (
        <>
          <ReactiveCore theme={theme} />
          <WaveField theme={theme} />
          <Particles theme={theme} />
        </>
      )}
      
      {/* Default idle sphere when no audio */}
      {!audioFile && (
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            color={themeSettings.coreColor} 
            emissive={themeSettings.coreColor}
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      )}
    </>
  );
};