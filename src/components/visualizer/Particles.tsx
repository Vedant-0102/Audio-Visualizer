import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ThemeType } from '../../store/store';
import { getTrebleLevel, getBeatDetection } from '../../utils/audioProcessing';

interface ParticlesProps {
  theme: ThemeType;
}

export const Particles: React.FC<ParticlesProps> = ({ theme }) => {
  const { frequencyData, timeData, isPlaying } = useStore();
  const pointsRef = useRef<THREE.Points>(null);
  
  // Increased number of particles for more subtle, dense effect
  const count = 2000;
  
  // Get theme color with more subtle, soothing palettes
  const getThemeColors = () => {
    switch (theme) {
      case 'cosmic':
        return { 
          main: '#e9d5ff',  // Lighter purple
          secondary: '#a855f7', // Softer purple
          tertiary: '#7e22ce'  // Deep purple for depth
        };
      case 'firestorm':
        return { 
          main: '#fef3c7',  // Warm light
          secondary: '#fb923c', // Soft orange
          tertiary: '#ea580c'  // Deep orange
        };
      case 'electric':
        return { 
          main: '#cffafe',  // Light cyan
          secondary: '#22d3ee', // Soft cyan
          tertiary: '#0891b2'  // Deep cyan
        };
      case 'aurora':
        return { 
          main: '#d1fae5',  // Light green
          secondary: '#34d399', // Soft green
          tertiary: '#059669'  // Deep green
        };
      default:
        return { 
          main: '#e9d5ff', 
          secondary: '#a855f7',
          tertiary: '#7e22ce' 
        };
    }
  };
  
  const colors = getThemeColors();
  
  // Create particles with improved distribution and movement
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocity = new Float32Array(count * 3);
    const life = new Float32Array(count);
    
    const color1 = new THREE.Color(colors.main);
    const color2 = new THREE.Color(colors.secondary);
    const color3 = new THREE.Color(colors.tertiary);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create layered sphere distribution
      const radius = 2 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Smoother, more organic velocity
      const speed = 0.002 + Math.random() * 0.003;
      velocity[i3] = (Math.random() - 0.5) * speed;
      velocity[i3 + 1] = (Math.random() - 0.5) * speed;
      velocity[i3 + 2] = (Math.random() - 0.5) * speed;
      
      // Gradient between three colors for more depth
      const mixFactor = Math.random();
      let finalColor;
      if (mixFactor < 0.33) {
        finalColor = color1.clone().lerp(color2, mixFactor * 3);
      } else if (mixFactor < 0.66) {
        finalColor = color2.clone().lerp(color3, (mixFactor - 0.33) * 3);
      } else {
        finalColor = color3.clone().lerp(color1, (mixFactor - 0.66) * 3);
      }
      
      colors[i3] = finalColor.r;
      colors[i3 + 1] = finalColor.g;
      colors[i3 + 2] = finalColor.b;
      
      // Varied sizes for depth
      sizes[i] = 0.5 + Math.random() * 1.5;
      
      // Add life property for fade effects
      life[i] = Math.random();
    }
    
    return { positions, colors, sizes, velocity, life };
  }, [theme]);
  
  const pointsMaterial = useRef<THREE.PointsMaterial>(null);
  
  useFrame((state, delta) => {
    if (!pointsRef.current || !pointsMaterial.current || !isPlaying) return;
    
    const trebleLevel = getTrebleLevel(frequencyData);
    const beatDetected = getBeatDetection(timeData);
    
    // Smoother material updates
    if (pointsMaterial.current) {
      const targetSize = 0.03 + trebleLevel * 0.05;
      pointsMaterial.current.size += (targetSize - pointsMaterial.current.size) * 0.1;
      
      if (beatDetected) {
        pointsMaterial.current.size *= 1.2;
      }
    }
    
    // Get position attribute
    const positionAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = positionAttr.array as Float32Array;
    
    // Update positions with organic movement
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Smooth position updates
      positions[i3] += particles.velocity[i3] * (1 + trebleLevel * 5);
      positions[i3 + 1] += particles.velocity[i3 + 1] * (1 + trebleLevel * 5);
      positions[i3 + 2] += particles.velocity[i3 + 2] * (1 + trebleLevel * 5);
      
      // Add gentle swirling motion
      const time = state.clock.elapsedTime;
      const radius = Math.sqrt(
        positions[i3] ** 2 + 
        positions[i3 + 1] ** 2 + 
        positions[i3 + 2] ** 2
      );
      
      positions[i3] += Math.sin(time * 0.1 + radius) * 0.001;
      positions[i3 + 1] += Math.cos(time * 0.15 + radius) * 0.001;
      positions[i3 + 2] += Math.sin(time * 0.12 + radius) * 0.001;
      
      // Particle recycling with smooth transitions
      if (radius > 8) {
        const newRadius = 2 + Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Smooth transition to new position
        positions[i3] = newRadius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = newRadius * Math.cos(phi);
        
        // Reset velocity with gentler movement
        particles.velocity[i3] = (Math.random() - 0.5) * 0.002;
        particles.velocity[i3 + 1] = (Math.random() - 0.5) * 0.002;
        particles.velocity[i3 + 2] = (Math.random() - 0.5) * 0.002;
      }
    }
    
    // Update geometry
    positionAttr.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particles.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={particles.colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={pointsMaterial}
        size={0.03}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};