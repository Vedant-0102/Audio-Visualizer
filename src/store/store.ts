import { create } from 'zustand';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export type ThemeType = 'cosmic' | 'firestorm' | 'electric' | 'aurora';

interface AudioState {
  audioContext: AudioContext | null;
  audioElement: HTMLAudioElement | null;
  audioFile: File | null;
  objectUrl: string | null;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  isPlaying: boolean;
  volume: number;
  theme: ThemeType;

  // Actions
  setAudioFile: (file: File | null) => void;
  initAudio: (file: File) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setTheme: (theme: ThemeType) => void;
  updateAnalyser: () => void;
  destroyAudio: () => void;
  setCurrentTime: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export const useStore = create<AudioState>((set, get) => ({
  audioContext: null,
  audioElement: null,
  audioFile: null,
  objectUrl: null,
  analyser: null,
  frequencyData: new Uint8Array(),
  timeData: new Uint8Array(),
  isPlaying: false,
  volume: 0.8,
  theme: 'cosmic',

  setAudioFile: (file) => set({ audioFile: file }),

  initAudio: (file) => {
    const { destroyAudio } = get();
    destroyAudio(); // Clean up previous audio if exists

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioElement = new Audio();
      audioElement.crossOrigin = 'anonymous';

      const objectUrl = URL.createObjectURL(file);
      audioElement.src = objectUrl;
      audioElement.volume = get().volume;

      const source = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.frequencyBinCount);

      set({
        audioContext,
        audioElement,
        audioFile: file,
        objectUrl,
        analyser,
        frequencyData,
        timeData,
      });

      audioElement.play().then(() => {
        set({ isPlaying: true });
      }).catch(err => {
        console.error('Error playing audio:', err);
        set({ isPlaying: false });
      });

      audioElement.addEventListener('ended', () => {
        set({ isPlaying: false });
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  },

  togglePlay: () => {
    const { audioElement, isPlaying } = get();

    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(err => console.error(err));
    }

    set({ isPlaying: !isPlaying });
  },

  setVolume: (volume) => {
    const { audioElement } = get();

    if (audioElement) {
      audioElement.volume = volume;
    }

    set({ volume });
  },

  setTheme: (theme) => set({ theme }),

  updateAnalyser: () => {
    const { analyser, frequencyData, timeData } = get();

    if (analyser) {
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeData);
    }
  },

  destroyAudio: () => {
    const { audioContext, audioElement, objectUrl } = get();

    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    if (audioContext) {
      audioContext.close().catch(err => console.error(err));
    }

    set({
      audioContext: null,
      audioElement: null,
      audioFile: null,
      objectUrl: null,
      analyser: null,
      isPlaying: false,
      frequencyData: new Uint8Array(),
      timeData: new Uint8Array(),
    });
  },

  setCurrentTime: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
    }
  },

  getCurrentTime: () => {
    const { audioElement } = get();
    return audioElement ? audioElement.currentTime : 0;
  },

  getDuration: () => {
    const { audioElement } = get();
    return audioElement ? audioElement.duration : 0;
  },
}));
