import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { 
  Folder, 
  Film, 
  PlusCircle, 
  Eye, 
  Star, 
  Volume2, 
  FileCode, 
  Sparkles, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { FileItem } from '../types';
import { fileSystemService } from '../services/fileSystemService';
import { premiereService } from '../services/premiereService';
import { AudioWaveform } from './AudioWaveform';
import { LABEL_COLORS } from '../constants/colors';

interface FileCardProps {
  item: FileItem;
  isSelected: boolean;
  isStarred?: boolean;
  volume: number;
  gridSize?: number;
  hoverScrubEnabled?: boolean;
  onSelect: (item: FileItem) => void;
  onOpen: (item: FileItem) => void;
  onQuickLook: (item: FileItem) => void;
  onToggleStar: (item: FileItem) => void;
  onContextMenu?: (e: React.MouseEvent, item: FileItem) => void;
}

export const FileCard: React.FC<FileCardProps> = memo(({
  item,
  isSelected,
  isStarred = false,
  volume = 0.75,
  gridSize = 140,
  hoverScrubEnabled = false,
  onSelect,
  onOpen,
  onQuickLook,
  onToggleStar,
  onContextMenu
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingAudible, setIsPlayingAudible] = useState(false);
  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [scrubPosition, setScrubPosition] = useState<number | null>(null);
  const [scrubTimecode, setScrubTimecode] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | undefined>(item.thumbnailUrl);
  const [fontFamilyName, setFontFamilyName] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const fileUrl = fileSystemService.getFileUrl(item.path);

  const isActive = isHovered || isSelected;
  const thumbHeight = Math.max(68, Math.round(gridSize * 0.72));

  const labelConfig = item.labelColor ? LABEL_COLORS.find(c => c.id === item.labelColor) : null;

  useEffect(() => {
    if (item.thumbnailUrl) {
      setThumbUrl(item.thumbnailUrl);
    }
  }, [item.thumbnailUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  useEffect(() => {
    if (isSelected && item.mediaType === 'video') {
      const timer = setTimeout(() => {
        setShouldMountVideo(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isSelected && !isHovered && !isPlayingAudible) {
      setShouldMountVideo(false);
      setVideoProgress(0);
      setScrubPosition(null);
      setScrubTimecode(null);
    }
  }, [isSelected, isHovered, isPlayingAudible, item.mediaType]);

  useEffect(() => {
    if (item.mediaType === 'font') {
      const family = 'FontCard_' + item.name.replace(/[^a-zA-Z0-9]/g, '_');
      setFontFamilyName(family);

      const styleId = 'card-font-' + family;
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          @font-face {
            font-family: '${family}';
            src: url('${fileUrl}');
          }
        `;
        document.head.appendChild(styleEl);
      }
    }
  }, [item, fileUrl]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);

    if (item.mediaType === 'video') {
      hoverTimerRef.current = setTimeout(() => {
        setShouldMountVideo(true);
      }, hoverScrubEnabled ? 50 : 120);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScrubPosition(null);
    setScrubTimecode(null);

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (item.mediaType === 'video' && !isSelected && !isPlayingAudible) {
      setShouldMountVideo(false);
      setVideoProgress(0);
    }
  };

  const handleThumbnailMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverScrubEnabled || item.mediaType !== 'video') return;

    if (!shouldMountVideo) {
      setShouldMountVideo(true);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      setScrubPosition(pct * 100);

      if (videoRef.current && videoRef.current.duration && !isSeekingRef.current) {
        const targetTime = pct * videoRef.current.duration;
        isSeekingRef.current = true;
        videoRef.current.currentTime = targetTime;
        setVideoProgress(pct * 100);
        setScrubTimecode(formatTime(targetTime));
        setTimeout(() => { isSeekingRef.current = false; }, 35);
      }
    });
  }, [item.mediaType, shouldMountVideo, hoverScrubEnabled]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item);

    if (item.mediaType === 'video') {
      const nextAudible = !isPlayingAudible;
      setIsPlayingAudible(nextAudible);
      if (nextAudible) {
        setShouldMountVideo(true);
        if (videoRef.current) {
          videoRef.current.volume = Math.max(0, Math.min(1, volume));
          videoRef.current.muted = false;
          videoRef.current.play().catch(() => {});
        }
      } else {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    } else if (item.mediaType === 'audio') {
      setIsPlayingAudible(!isPlayingAudible);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(item);
    if (onContextMenu) {
      onContextMenu(e, item);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && scrubPosition === null) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setVideoProgress((cur / dur) * 100);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.path);
  };

  const handleInsertTimeline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await premiereService.insertAtPlayhead(item.path);
  };

  const renderThumbnail = () => {
    if (item.isDirectory) {
      const folderColorClass = labelConfig ? labelConfig.text : 'text-blue-400';
      const folderBgClass = labelConfig ? labelConfig.bg : 'bg-blue-500/10';

      return (
        <div className={`w-full h-full flex flex-col items-center justify-center ${folderBgClass} ${folderColorClass}`}>
          <Folder className="w-10 h-10 stroke-[1.5]" />
        </div>
      );
    }

    if (item.mediaType === 'video') {
      return (
        <div 
          onMouseMove={handleThumbnailMouseMove}
          className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden ${
            hoverScrubEnabled ? 'cursor-ew-resize' : ''
          }`}
        >
          {(!shouldMountVideo || videoError) && (
            thumbUrl ? (
              <img
                src={thumbUrl}
                alt={item.name}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/80 text-sky-400">
                <Film className="w-6 h-6 mb-1 opacity-70" />
                <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-wider">
                  {item.extension.replace('.', '') || 'VIDEO'}
                </span>
              </div>
            )
          )}

          {shouldMountVideo && !videoError && (
            <video
              ref={videoRef}
              src={fileUrl}
              autoPlay={!scrubPosition}
              playsInline
              loop
              muted={!isPlayingAudible}
              onError={() => setVideoError(true)}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover animate-fade-in pointer-events-none"
            />
          )}

          {/* Scrub Floating Timecode Badge */}
          {hoverScrubEnabled && scrubTimecode && isHovered && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/85 border border-white/20 text-[8px] font-mono font-bold text-white flex items-center gap-1 shadow-2xl z-20 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-accent animate-ping" />
              <span>{scrubTimecode}</span>
            </div>
          )}

          {isPlayingAudible && !scrubTimecode && (
            <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-emerald-500/80 text-[8px] font-bold text-white flex items-center gap-0.5 shadow-lg z-20 animate-pulse">
              <Volume2 className="w-2.5 h-2.5" />
              <span>{Math.round(volume * 100)}%</span>
            </div>
          )}

          {videoError && (
            <div className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-rose-500/80 text-white text-[7px] flex items-center gap-0.5">
              <AlertCircle className="w-2 h-2" />
              <span>Codec 8K</span>
            </div>
          )}

          {/* Progress / Scrubbing Bar */}
          {isActive && shouldMountVideo && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-20">
              <div 
                className="h-full bg-apple-accent shadow-md shadow-apple-accent/50 transition-all duration-75"
                style={{ width: `${videoProgress}%` }}
              />
              {hoverScrubEnabled && scrubPosition !== null && (
                <div 
                  className="absolute top-[-2px] w-1 h-2 bg-white rounded-full shadow-lg pointer-events-none"
                  style={{ left: `${scrubPosition}%` }}
                />
              )}
            </div>
          )}
        </div>
      );
    }

    if (item.mediaType === 'audio') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-pink-950/30 to-purple-950/30">
          <AudioWaveform
            filePath={item.path}
            isHovered={isActive}
            isPlayingAudible={isPlayingAudible}
            compact={true}
            volume={volume}
            onTogglePlay={() => setIsPlayingAudible(!isPlayingAudible)}
          />
        </div>
      );
    }

    if (item.mediaType === 'font') {
      return (
        <div className="w-full h-full p-1.5 flex flex-col justify-between bg-gradient-to-br from-emerald-950/30 to-teal-950/30 text-emerald-300">
          <div className="text-right pr-6">
            <span className="text-[7px] uppercase font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
              {item.extension.toUpperCase()}
            </span>
          </div>
          <div 
            style={{ fontFamily: fontFamilyName }}
            className="text-lg font-bold text-white text-center truncate leading-none my-auto"
          >
            Aa Bb 123
          </div>
          <div className="text-[8px] text-zinc-400 text-center truncate font-mono">
            {item.name.replace(/\.[^/.]+$/, '')}
          </div>
        </div>
      );
    }

    if (item.mediaType === 'image') {
      return (
        <div className="relative w-full h-full bg-black/30 overflow-hidden flex items-center justify-center">
          <img
            src={fileUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }

    if (item.mediaType === 'mogrt') {
      if (thumbUrl) {
        return (
          <div className="relative w-full h-full bg-black/50 overflow-hidden flex items-center justify-center">
            <img
              src={thumbUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-purple-950/80 text-[7px] font-bold text-purple-300 uppercase">
              MOGRT
            </div>
          </div>
        );
      }
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/30 to-indigo-950/30 text-purple-400 p-1.5 text-center">
          <Sparkles className="w-6 h-6 mb-1" />
          <span className="text-[8px] uppercase font-bold text-purple-300">MOGRT</span>
        </div>
      );
    }

    if (item.mediaType === 'project') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-purple-400">
          <FileCode className="w-6 h-6 text-purple-400 mb-1" />
          <span className="text-[8px] uppercase font-bold text-purple-300">{item.extension}</span>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/40 text-zinc-400">
        <FileText className="w-6 h-6" />
        <span className="text-[8px] uppercase mt-1">{item.extension}</span>
      </div>
    );
  };

  return (
    <div
      data-path={item.path}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={() => (item.isDirectory ? onOpen(item) : onQuickLook(item))}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col rounded-xl overflow-hidden glass-card cursor-pointer select-none transition-all duration-75 transform-gpu ${
        isSelected 
          ? 'border-2 border-white bg-white/10 shadow-lg shadow-white/5 z-10' 
          : 'hover:border-white/40 hover:bg-white/5'
      }`}
    >
      <div 
        style={{ height: `${thumbHeight}px` }}
        className="w-full relative bg-black/60 overflow-hidden flex items-center justify-center shrink-0"
      >
        {renderThumbnail()}

        {/* ⭐ Star Button — MOVED TO TOP-RIGHT */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(item);
          }}
          className={`absolute top-1 right-1 p-1 rounded-md transition-all z-20 ${
            isStarred 
              ? 'bg-amber-500/30 text-amber-400 opacity-100 shadow-md' 
              : isActive
              ? 'bg-black/70 text-zinc-300 opacity-100 hover:text-white'
              : 'bg-black/60 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
          title={isStarred ? "Remover dos Favoritos" : "Favoritar (Pasta ou Arquivo)"}
        >
          <Star className={`w-3 h-3 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {/* Color Label Dot */}
        {labelConfig && (
          <div 
            style={{ backgroundColor: labelConfig.dot }}
            className="absolute top-2 right-7 w-2 h-2 rounded-full shadow-md z-20"
            title={`Etiqueta: ${labelConfig.name}`}
          />
        )}

        {/* Bottom-Right Action Buttons */}
        {!item.isDirectory && isActive && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 z-20 animate-fade-in bg-black/70 p-0.5 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickLook(item);
              }}
              className="p-1 rounded-md bg-white/10 hover:bg-white/30 text-zinc-200 hover:text-white transition-colors"
              title="QuickLook (Espaço)"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={handleInsertTimeline}
              className="p-1 rounded-md bg-apple-accent hover:bg-apple-accentHover text-white shadow-sm transition-colors"
              title="Inserir na Timeline (Enter)"
            >
              <PlusCircle className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Card Info Label */}
      <div className={`p-1.5 flex flex-col justify-between flex-1 min-w-0 transition-colors ${
        isSelected ? 'bg-white/10' : 'bg-black/35'
      }`}>
        <div className="flex items-center gap-1 min-w-0">
          {labelConfig && (
            <div 
              style={{ backgroundColor: labelConfig.dot }} 
              className="w-1.5 h-1.5 rounded-full shrink-0" 
            />
          )}
          <span 
            style={{ fontSize: gridSize < 120 ? '10px' : '11px' }}
            className={`font-medium truncate leading-tight ${
              isSelected ? 'text-white font-semibold' : 'text-zinc-200 group-hover:text-white'
            }`} 
            title={item.name}
          >
            {item.name}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-1 text-[8px] text-apple-textMuted">
          <span className="truncate">{item.isDirectory ? 'Pasta' : item.sizeFormatted}</span>
          <span className={`uppercase text-[7px] px-1 py-0.2 rounded font-semibold shrink-0 ${
            isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
          }`}>
            {item.mediaType}
          </span>
        </div>
      </div>
    </div>
  );
});
