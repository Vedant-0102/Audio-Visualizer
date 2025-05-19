export function getBassLevel(frequencyData: Uint8Array): number {
  // Bass range: ~20-250Hz (lower frequencies)
  const start = 0;
  const end = 20;
  
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * (end - start)); 
}

export function getMidLevel(frequencyData: Uint8Array): number {
  // Mid-range: ~250-2000Hz
  const start = 20;
  const end = 80;
  
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * (end - start)); 
}

export function getTrebleLevel(frequencyData: Uint8Array): number {
  // Treble range: ~2000-20000Hz (higher frequencies)

  const start = 80;
  const end = Math.min(frequencyData.length, 200); 
  
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * (end - start)); 
}

export function getAverageLoudness(frequencyData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i] || 0;
  }
  
  return sum / (255 * frequencyData.length); 
}

let prevAvg = 0;
let beatHoldTime = 0;
let beatDecayRate = 0.97;
let beatThreshold = 0.11;

export function getBeatDetection(timeData: Uint8Array): boolean {
  
  let sum = 0;
  const length = timeData.length;
  
  for (let i = 0; i < length; i++) {
    // Convert from 0-255 to -128-127
    const amplitude = ((timeData[i] || 0) - 128) / 128;
    sum += Math.abs(amplitude);
  }
  
  const avg = sum / length;
  
  const beat = avg > prevAvg * 1.2 && avg > beatThreshold;
  
  prevAvg = avg;
  
  if (beat) {
    beatHoldTime = 4; 
  } else {
    beatHoldTime = Math.max(0, beatHoldTime - 1);
  }
  
  return beatHoldTime > 0;
}