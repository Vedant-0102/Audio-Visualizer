import React from 'react';
import { Canvas } from '@react-three/fiber';
import { AudioUpload } from './components/AudioUpload';
import { VisualizerScene } from './components/VisualizerScene';
import { Controls } from './components/Controls';
import { useStore } from './store/store';

function App() {
  const { audioFile, isPlaying } = useStore();

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <VisualizerScene />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="w-full h-full flex flex-col items-center justify-between p-6">
          {/* Title */}
          <div className="w-full flex justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white opacity-80 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 bg-clip-text text-transparent">
              Audio Sphere Visualizer
            </h1>
          </div>

          {/* Audio Upload Area - center of screen if no audio */}
          {!audioFile && (
            <div className="flex-grow flex items-center justify-center w-full max-w-lg pointer-events-auto">
              <AudioUpload />
            </div>
          )}

          {/* Controls - bottom */}
          <div className="w-full max-w-xl pointer-events-auto">
            <Controls />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;