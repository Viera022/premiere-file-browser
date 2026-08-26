import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { fileSystemService } from '../services/fileSystemService';

interface AudioWaveformProps {
  filePath: string;
  isHovered?: boolean;
  isPlayingAudible?: boolean;
  compact?: boolean;
  volume?: number;
  onTogglePlay?: () => void;
}

// Global active audio controller to prevent multi-audio leaks & DOM lag
let activeGlobalAudio: HTMLAudioElement | null = null;

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  filePath, 
  isHovered = false, 
  isPlayingAudible = false,
  compact = false,
  volume = 0.75,
  onTogglePlay
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [audioMounted, setAudioMounted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileUrl = useMemo(() => fileSystemService.getFileUrl(filePath), [filePath]);

  const barHeights = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < filePath.length; i++) {
      hash = ((hash << 5) - hash) + filePath.charCodeAt(i);
      hash |= 0;
    }
    const count = compact ? 22 : 36;
    const bars: number[] = [];
    for (let i = 0; i < count; i++) {
      const pseudoVal = Math.abs(Math.sin(hash + i * 0.65));
      bars.push(Math.max(0.18, Math.min(1.0, pseudoVal)));
    }
    return bars;
  }, [filePath, compact]);

  // Mount audio only when needed (Lazy loading = 0 CPU lag)
  useEffect(() => {
    if (isHovered || isPlayingAudible) {
      setAudioMounted(true);
    }
  }, [isHovered, isPlayingAudible]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  useEffect(() => {
    if (!audioMounted || !audioRef.current) return;

    if (isHovered && !isPlayingAudible) {
      if (activeGlobalAudio && activeGlobalAudio !== audioRef.current) {
        activeGlobalAudio.pause();
        activeGlobalAudio.currentTime = 0;
      }
      activeGlobalAudio = audioRef.current;

      audioRef.current.currentTime = 0;
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else if (!isHovered && !isPlayingAudible) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      setHoverPosition(null);
    }
  }, [isHovered, isPlayingAudible, volume, audioMounted]);

  useEffect(() => {
    if (!audioMounted || !audioRef.current) return;
    if (isPlayingAudible) {
      if (activeGlobalAudio && activeGlobalAudio !== audioRef.current) {
        activeGlobalAudio.pause();
      }
      activeGlobalAudio = audioRef.current;

      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else if (!isHovered) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlayingAudible, isHovered, volume, audioMounted]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(cur);
    setProgress(cur / dur);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
    audioRef.current.volume = Math.max(0, Math.min(1, volume));
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleWaveMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pct * 100);

    if (e.buttons === 1 && audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = pct * audioRef.current.duration;
      setProgress(pct);
    }
  }, []);

  const handleWaveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setAudioMounted(true);
    setTimeout(() => {
      if (!audioRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      audioRef.current.currentTime = pct * (audioRef.current.duration || 1);
      setProgress(pct);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }, 10);
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 select-none">
      {audioMounted && (
        <audio
          ref={audioRef}
          src={fileUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

      {/* Top Controls Row: Play/Pause on Left, Duration in Center, Status on Right */}
      <div className="flex items-center justify-between gap-1.5 pr-6">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform shrink-0 ${
            isPlaying ? 'bg-pink-500 text-white shadow-md shadow-pink-500/40 scale-105' : 'bg-white/10 text-pink-300'
          }`}>
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </div>
          <span className="text-[10px] font-mono text-zinc-300 truncate">
            {formatSec(currentTime)} / {formatSec(duration)}
          </span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-pink-500/30 text-pink-300 text-[8px] font-bold uppercase animate-pulse shrink-0">
            <Volume2 className="w-2.5 h-2.5 mr-0.5" />
            <span>Audio</span>
          </div>
        )}
      </div>

      {/* Waveform Bars */}
      <div
        onClick={handleWaveClick}
        onMouseMove={handleWaveMouseMove}
        onMouseLeave={() => setHoverPosition(null)}
        className="w-full h-12 flex items-center gap-[2px] cursor-pointer bg-black/40 rounded-lg p-1.5 hover:bg-black/60 transition-colors relative mt-1"
        title="Passe o mouse ou clique para escanear no áudio"
      >
        {barHeights.map((h, i) => {
          const barPct = i / barHeights.length;
          const isPassed = barPct <= progress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-75 ${
                isPassed 
                  ? 'bg-gradient-to-t from-pink-500 to-rose-400 shadow-sm shadow-pink-500/50' 
                  : isHovered 
                  ? 'bg-white/30' 
                  : 'bg-white/15'
              }`}
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          );
        })}

        {/* Hover Scrubbing Line */}
        {hoverPosition !== null && (
          <div 
            className="absolute top-1 bottom-1 w-[1.5px] bg-white/70 shadow-md rounded-full pointer-events-none"
            style={{ left: `${hoverPosition}%` }}
          />
        )}

        {/* Active Playhead */}
        {isPlaying && (
          <div 
            className="absolute top-1 bottom-1 w-[2px] bg-white shadow-md rounded-full pointer-events-none transition-all duration-75"
            style={{ left: `${Math.max(2, Math.min(98, progress * 100))}%` }}
          />
        )}
      </div>
    </div>
  );
};
