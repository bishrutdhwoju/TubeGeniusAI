import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  blob?: Blob;
  onRegenerate?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, blob }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setProgress((audio.currentTime / audio.duration) * 100);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = time;
    setProgress(parseFloat(e.target.value));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const handleDownload = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceover-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
      <audio ref={audioRef} src={src} />
      
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-300">Generated Voiceover</h4>
        <span className="text-xs text-slate-500 font-mono">
          {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
        </span>
      </div>

      <div className="relative w-full h-12 bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
         {/* Visualizer Placeholder */}
         <div className="flex items-end justify-center gap-[2px] h-8 w-full px-4 opacity-50">
            {Array.from({ length: 40 }).map((_, i) => (
                <div 
                    key={i} 
                    className="w-1.5 bg-brand-500 rounded-t-sm transition-all duration-75"
                    style={{ 
                        height: isPlaying ? `${Math.random() * 100}%` : '20%',
                        opacity: isPlaying ? 1 : 0.3
                    }}
                />
            ))}
         </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime = 0;
          }}
          className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-700 rounded-full"
          title="Replay"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white rounded-full transition-all shadow-lg shadow-brand-900/40"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />

        <button
          onClick={handleDownload}
          disabled={!blob}
          className="p-2 text-slate-400 hover:text-brand-400 transition-colors hover:bg-slate-700 rounded-full disabled:opacity-50"
          title="Download WAV"
        >
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};
