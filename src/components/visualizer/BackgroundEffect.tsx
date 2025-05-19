import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ThemeType } from '../../store/store';
import { getBassLevel, getBeatDetection } from '../../utils/audioProcessing';

interface BackgroundEffectProps {
  theme: ThemeType;
}

export const BackgroundEffect: React.FC<BackgroundEffectProps> = ({ theme }) => {
  const { frequencyData, timeData, audioFile } = useStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const getThemeColors = () => {
    switch (theme) {
      case 'cosmic': return { primary: '#4c1d95', secondary: '#2e1065' };
      case 'firestorm': return { primary: '#7c2d12', secondary: '#431407' };
      case 'electric': return { primary: '#0e7490', secondary: '#164e63' };
      case 'aurora': return { primary: '#065f46', secondary: '#064e3b' };
      default: return { primary: '#4c1d95', secondary: '#2e1065' };
    }
  };

  const colors = getThemeColors();

  useFrame((state) => {
    if (!meshRef.current || !audioFile) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uBassLevel.value = getBassLevel(frequencyData);
    material.uniforms.uBeat.value = getBeatDetection(timeData) ? 1.0 : 0.0;
  });

  // Don't render anything if no audio file is loaded
  if (!audioFile) {
    return null;
  }

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBassLevel: { value: 0 },
      uBeat: { value: 0 },
      uColorPrimary: { value: new THREE.Color(colors.primary) },
      uColorSecondary: { value: new THREE.Color(colors.secondary) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uBassLevel;
      uniform float uBeat;
      uniform vec3 uColorPrimary;
      uniform vec3 uColorSecondary;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float noise(vec2 p) {
        return sin(p.x * 10.0) * sin(p.y * 10.0);
      }

      void main() {
        vec2 center = vUv - 0.5;
        float dist = length(center);
        float waves = sin(dist * 20.0 - uTime * 0.5) * 0.5 + 0.5;
        float n = noise(vUv * 2.0 + uTime * 0.1) * 0.5 + 0.5;
        vec3 color = mix(uColorPrimary, uColorSecondary, dist);
        float ripple = smoothstep(0.5, 0.8, sin(dist * 50.0 - uTime * 2.0) * 0.5 + 0.5);
        ripple *= uBeat * (1.0 - dist * 2.0);
        color = mix(color, uColorPrimary, waves * uBassLevel * 0.5);
        color += vec3(ripple);
        float alpha = smoothstep(1.0, 0.5, dist * 2.0);
        gl_FragColor = vec4(color, alpha * 0.4);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
};
