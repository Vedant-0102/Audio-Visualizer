import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RefreshCw, Palette, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore, ThemeType } from '../store/store';

// Helper function to format time in MM:SS
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const Controls: React.FC = () => {
  const { 
    audioFile, 
    isPlaying, 
    volume,
    theme,
    togglePlay, 
    setVolume,
    setTheme,
    setAudioFile,
    getCurrentTime,
    getDuration,
    setCurrentTime
  } = useStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTime, setTimeState] = useState(0);
  const [duration, setDurationState] = useState(0);

  // Update time display
  useEffect(() => {
    if (!audioFile) return;
    
    const updateTime = () => {
      setTimeState(getCurrentTime());
      setDurationState(getDuration());
    };
    
    const interval = setInterval(updateTime, 1000);
    updateTime(); // Initial update
    
    return () => clearInterval(interval);
  }, [audioFile, getCurrentTime, getDuration]);

  if (!audioFile) return null;

  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'cosmic', label: 'Cosmic', color: 'from-purple-600 to-indigo-800' },
    { id: 'firestorm', label: 'Firestorm', color: 'from-orange-500 to-red-700' },
    { id: 'electric', label: 'Electric', color: 'from-cyan-400 to-blue-600' },
    { id: 'aurora', label: 'Aurora', color: 'from-green-400 to-teal-600' },
  ];

  return (
    <div className="w-full bg-black/50 backdrop-blur-md rounded-xl text-white overflow-hidden transition-all duration-300">
      {/* Collapse toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 flex items-center justify-between hover:bg-white/5"
      >
        <span className="font-medium truncate">{audioFile.name}</span>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>
      
      {/* Collapsible content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-64' : 'max-h-0'} overflow-hidden`}>
        <div className="p-4 space-y-4">
          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <button 
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>
            
            <div className="flex items-center space-x-2 flex-1 ml-4">
              <button 
                onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                className="text-gray-300 hover:text-white"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(147, 51, 234) ${volume * 100}%, rgb(75, 85, 99) ${volume * 100}%)`,
                }}
              />
            </div>
            
            <button 
              onClick={() => setAudioFile(null)}
              className="ml-4 text-gray-400 hover:text-white"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          {/* Audio timeline */}
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(147, 51, 234) ${(currentTime / (duration || 1)) * 100}%, rgb(75, 85, 99) ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
          </div>
          
          {/* Theme selector */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Palette size={16} />
              <span>Visualization Theme</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`
                    py-1 px-2 text-xs rounded transition-all 
                    ${theme === t.id 
                      ? `bg-gradient-to-r ${t.color} text-white ring-2 ring-white/30` 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};