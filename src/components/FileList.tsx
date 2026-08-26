import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  Film, 
  Music, 
  Image as ImageIcon, 
  Sparkles, 
  FileText, 
  Star, 
  PlusCircle, 
  Eye, 
  Type, 
  FileCode,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { FileItem } from '../types';
import { fileSystemService } from '../services/fileSystemService';
import { premiereService } from '../services/premiereService';
import { LABEL_COLORS } from '../constants/colors';

interface FileListProps {
  items: FileItem[];
  selectedItem: FileItem | null;
  volume?: number;
  onSelect: (item: FileItem) => void;
  onOpen: (item: FileItem) => void;
  onQuickLook: (item: FileItem) => void;
  onToggleStar: (item: FileItem) => void;
  onContextMenu?: (e: React.MouseEvent, item: FileItem) => void;
}

const CHUNK_SIZE = 100;

export const FileList: React.FC<FileListProps> = ({
  items,
  selectedItem,
  volume = 0.75,
  onSelect,
  onOpen,
  onQuickLook,
  onToggleStar,
  onContextMenu
}) => {
  const [renderedCount, setRenderedCount] = useState(CHUNK_SIZE);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [playingPath, setPlayingPath] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRenderedCount(CHUNK_SIZE);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 300) {
      if (renderedCount < items.length) {
        setRenderedCount(prev => Math.min(items.length, prev + CHUNK_SIZE));
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  const handleMouseEnter = (item: FileItem) => {
    setHoveredPath(item.path);

    if (item.mediaType === 'audio' && !playingPath) {
      if (audioRef.current) {
        audioRef.current.src = fileSystemService.getFileUrl(item.path);
        audioRef.current.volume = Math.max(0, Math.min(1, volume));
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleMouseLeave = (item: FileItem) => {
    setHoveredPath(null);

    if (item.mediaType === 'audio' && !playingPath) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handleTogglePlay = (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item);

    if (item.mediaType === 'audio') {
      if (playingPath === item.path) {
        if (audioRef.current) audioRef.current.pause();
        setPlayingPath(null);
      } else {
        setPlayingPath(item.path);
        if (audioRef.current) {
          audioRef.current.src = fileSystemService.getFileUrl(item.path);
          audioRef.current.volume = Math.max(0, Math.min(1, volume));
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }
    } else {
      onSelect(item);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(item);
    if (onContextMenu) {
      onContextMenu(e, item);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 1);
    }
  };

  const handleEnded = () => {
    setPlayingPath(null);
    setCurrentTime(0);
  };

  const handleInsertTimeline = async (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await premiereService.insertAtPlayhead(item.path);
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
        <p className="text-xs">Nenhum arquivo ou pasta encontrado.</p>
      </div>
    );
  }

  const getMediaIcon = (item: FileItem) => {
    const labelConfig = item.labelColor ? LABEL_COLORS.find(c => c.id === item.labelColor) : null;
    if (item.isDirectory) {
      return <Folder className={`w-3.5 h-3.5 ${labelConfig ? labelConfig.text : 'text-blue-400'}`} />;
    }
    switch (item.mediaType) {
      case 'video': return <Film className="w-3.5 h-3.5 text-sky-400" />;
      case 'audio': return <Music className="w-3.5 h-3.5 text-pink-400" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'mogrt': return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'font': return <Type className="w-3.5 h-3.5 text-emerald-400" />;
      case 'project': return <FileCode className="w-3.5 h-3.5 text-purple-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const visibleItems = items.slice(0, renderedCount);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-2 select-none"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="w-full text-left">
        <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-apple-textMuted uppercase border-b border-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-amber-400 w-4 text-center">⭐</span>
            <span>Nome</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-16 text-right hidden sm:inline">Tamanho</span>
            <span className="w-16 text-right hidden xs:inline">Tipo</span>
            <span className="w-14 text-right">Ação</span>
          </div>
        </div>

        <div className="divide-y divide-white/[0.03] mt-0.5">
          {visibleItems.map((item) => {
            const isSelected = selectedItem?.path === item.path;
            const isHovered = hoveredPath === item.path;
            const isActive = isSelected || isHovered;
            const isPlaying = playingPath === item.path || (isHovered && !playingPath && item.mediaType === 'audio');
            const isAudioOrVideo = item.mediaType === 'audio' || item.mediaType === 'video';
            const labelConfig = item.labelColor ? LABEL_COLORS.find(c => c.id === item.labelColor) : null;

            return (
              <div
                key={item.path}
                data-path={item.path}
                onClick={(e) => (item.isDirectory ? onOpen(item) : handleTogglePlay(item, e))}
                onContextMenu={(e) => handleContextMenu(e, item)}
                onDoubleClick={() => (item.isDirectory ? onOpen(item) : onQuickLook(item))}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={() => handleMouseLeave(item)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-75 relative group ${
                  isSelected 
                    ? 'border border-white bg-white/15 text-white font-medium shadow-sm' 
                    : isPlaying
                    ? 'bg-pink-500/15 text-pink-200 border border-pink-500/20'
                    : 'hover:bg-white/5 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(item);
                      }}
                      className="text-zinc-400 hover:text-white"
                      title={item.isStarred ? "Remover dos Favoritos" : "Favoritar"}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  <div className="shrink-0">
                    {isAudioOrVideo ? (
                      <button
                        onClick={(e) => handleTogglePlay(item, e)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isPlaying
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/40 scale-105'
                            : 'bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white'
                        }`}
                        title={isPlaying ? "Pausar" : "Tocar Preview"}
                      >
                        {isPlaying ? (
                          <Pause className="w-2.5 h-2.5 fill-current" />
                        ) : (
                          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                        )}
                      </button>
                    ) : (
                      getMediaIcon(item)
                    )}
                  </div>

                  <span className="truncate font-medium flex items-center gap-1.5" title={item.name}>
                    {labelConfig && (
                      <span 
                        style={{ backgroundColor: labelConfig.dot }} 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                      />
                    )}
                    {item.name}
                    {isPlaying && item.mediaType === 'audio' && (
                      <span className="px-1 py-0.2 rounded bg-pink-500/30 text-pink-300 text-[8px] font-bold uppercase animate-pulse flex items-center gap-0.5">
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>Tocando</span>
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="w-16 text-right text-[10px] font-mono text-zinc-400 truncate hidden sm:inline">
                    {item.isDirectory ? '--' : item.sizeFormatted}
                  </span>

                  <span className="w-16 text-right text-[9px] uppercase font-semibold text-zinc-400 truncate hidden xs:inline">
                    {item.mediaType}
                  </span>

                  <div className="w-14 flex items-center justify-end gap-1">
                    {!item.isDirectory && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickLook(item);
                          }}
                          className={`p-1 rounded hover:bg-white/20 text-zinc-300 hover:text-white transition-opacity ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          title="QuickLook (Espaço)"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleInsertTimeline(item, e)}
                          className={`p-1 rounded bg-apple-accent hover:bg-apple-accentHover text-white transition-opacity shadow ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          title="Inserir na Timeline (Enter)"
                        >
                          <PlusCircle className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isPlaying && item.mediaType === 'audio' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/40 overflow-hidden rounded-b-lg">
                    <div 
                      className="h-full bg-pink-500 transition-all duration-75"
                      style={{ width: `${Math.max(2, Math.min(100, (currentTime / duration) * 100))}% ` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {renderedCount < items.length && (
          <div className="w-full py-3 text-center text-[10px] text-zinc-500 font-mono">
            Exibindo {renderedCount} de {items.length} itens...
          </div>
        )}
      </div>
    </div>
  );
};
