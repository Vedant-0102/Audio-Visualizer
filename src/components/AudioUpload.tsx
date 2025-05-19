import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { useStore } from '../store/store';

export const AudioUpload: React.FC = () => {
  const { initAudio } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFile = useCallback((file: File) => {
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
      initAudio(file);
    } else {
      alert('Please upload only MP3 or WAV files');
    }
  }, [initAudio]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);
  
  return (
    <div 
      className={`w-full max-w-md p-8 rounded-xl border-2 border-dashed transition-all duration-300 ${
        isDragging 
          ? 'border-purple-500 bg-purple-500/10 scale-105' 
          : 'border-gray-400 bg-black/40 hover:border-purple-400 hover:bg-purple-500/5'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <Upload className={`w-16 h-16 ${isDragging ? 'text-purple-400' : 'text-gray-200'}`} />
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-white">Upload Audio File</h3>
          <p className="text-gray-300">Drag and drop an MP3 or WAV file, or click to browse</p>
        </div>
        
        <label className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
          Browse Files
          <input
            type="file"
            className="hidden"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
};