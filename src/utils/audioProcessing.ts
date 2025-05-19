// Utility functions for audio processing

// Get average level for specific frequency ranges
export function getBassLevel(frequencyData: Uint8Array): number {
  // Bass range: ~20-250Hz (lower frequencies)
  // In a typical 1024 FFT, this might be roughly bins 0-20
  const start = 0;
  const end = 20;
  
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * (end - start)); // Normalize to 0-1
}

export function getMidLevel(frequencyData: Uint8Array): number {
  // Mid-range: ~250-2000Hz
  // In a typical 1024 FFT, this might be roughly bins 20-80
  const start = 20;
  const end = 80;
  
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * (end - start)); // Normalize to 0-1
}

export function getTrebleLevel(frequencyData: Uint8Array): number {
  // Treble range: ~2000-20000Hz (higher frequencies)
  // In a typical 1024 FFT, this might be roughly bins 80+
  const start = 80;
  const end = Math.min(frequencyData.length, 200); // Don't go beyond array bounds
  
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * (end - start)); // Normalize to 0-1
}

export function getAverageLoudness(frequencyData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * frequencyData.length); // Normalize to 0-1
}

// Simple beat detection based on waveform data
// Looks for sudden amplitude changes in audio waveform
let prevAvg = 0;
let beatHoldTime = 0;
let beatDecayRate = 0.97;
let beatThreshold = 0.11;

export function getBeatDetection(timeData: Uint8Array): boolean {
  // Get current average volume
  let sum = 0;
  const length = timeData.length;
  
  for (let i = 0; i < length; i++) {
    // Convert from 0-255 to -128-127
    const amplitude = ((timeData[i] || 0) - 128) / 128;
    sum += Math.abs(amplitude);
  }
  
  const avg = sum / length;
  
  // Beat detected if current average is significantly
  // higher than previous average and above threshold
  const beat = avg > prevAvg * 1.2 && avg > beatThreshold;
  
  // Update values for next time
  prevAvg = avg;
  
  // If we detected a beat, hold it for a few frames
  if (beat) {
    beatHoldTime = 4; // Hold for 4 frames
  } else {
    beatHoldTime = Math.max(0, beatHoldTime - 1);
  }
  
  return beatHoldTime > 0;
}