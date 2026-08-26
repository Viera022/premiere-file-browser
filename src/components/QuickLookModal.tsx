import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  PlusCircle, 
  FolderPlus, 
  ExternalLink,
  Sparkles,
  Layers,
  FileCode,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Type
} from 'lucide-react';
import { FileItem } from '../types';
import { fileSystemService } from '../services/fileSystemService';
import { premiereService } from '../services/premiereService';

interface QuickLookModalProps {
  item: FileItem | null;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onClose: () => void;
}

export const QuickLookModal: React.FC<QuickLookModalProps> = ({ 
  item, 
  volume = 0.75, 
  onVolumeChange, 
  onClose 
}) => {
  if (!item) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [inPoint, setInPoint] = useState(0);
  const [outPoint, setOutPoint] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [insertSuccess, setInsertSuccess] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Font Studio state
  const [fontFamilyName, setFontFamilyName] = useState('');
  const [previewText, setPreviewText] = useState('O rápido morcego marrom salta sobre o cão preguiçoso. 1234567890 !@#$%');
  const [fontSize, setFontSize] = useState(36);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const fileUrl = fileSystemService.getFileUrl(item.path);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (item.mediaType === 'font') {
      const family = 'FontPreview_' + item.name.replace(/[^a-zA-Z0-9]/g, '_');
      setFontFamilyName(family);

      const styleEl = document.createElement('style');
      styleEl.id = 'font-style-' + family;
      styleEl.textContent = `
        @font-face {
          font-family: '${family}';
          src: url('${fileUrl}');
        }
      `;
      document.head.appendChild(styleEl);

      return () => {
        const el = document.getElementById('font-style-' + family);
        if (el) el.remove();
      };
    }
  }, [item, fileUrl]);

  useEffect(() => {
    containerRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose]);

  const handleLoadedMetadata = () => {
    if (!mediaRef.current) return;
    const dur = mediaRef.current.duration || 0;
    setDuration(dur);
    setInPoint(0);
    setOutPoint(dur);
    mediaRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  };

  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    const cur = mediaRef.current.currentTime;
    setCurrentTime(cur);

    if (outPoint > inPoint && cur >= outPoint) {
      mediaRef.current.currentTime = inPoint;
    }
  };

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleInsertPlayhead = async () => {
    setIsInserting(true);
    const res = await premiereService.insertAtPlayhead(item.path, inPoint, outPoint);
    setIsInserting(false);
    if (res.success) {
      setInsertSuccess(true);
      setTimeout(() => setInsertSuccess(false), 2500);
    }
  };

  const handleImportBin = async () => {
    await premiereService.importFiles([item.path]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 bg-black/75 backdrop-blur-md animate-fade-in select-none overflow-hidden"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full flex flex-col glass-quicklook overflow-hidden shadow-quicklook outline-none transition-all duration-150 ${
          isMaximized 
            ? 'h-full max-h-full rounded-none' 
            : 'h-full max-h-[98%] sm:max-h-[88vh] max-w-4xl rounded-xl'
        }`}
      >
        {/* Title Bar */}
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-white/[0.04] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center text-white shrink-0 shadow"
              title="Fechar Preview (ESC / Espaço)"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
            <span className="text-xs font-semibold text-zinc-100 truncate max-w-xs sm:max-w-md">
              {item.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-zinc-400 font-mono hidden xs:inline">
              {item.sizeFormatted} • {item.mediaType.toUpperCase()}
            </span>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title={isMaximized ? "Restaurar Janela" : "Maximizar"}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => fileSystemService.revealInExplorer(item.path)}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Abrir no Explorer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Media Preview Viewport */}
        <div className="flex-1 min-h-0 w-full bg-black/90 flex items-center justify-center relative overflow-hidden p-2">
          {item.mediaType === 'video' && (
            <video
              ref={mediaRef as any}
              src={fileUrl}
              autoPlay
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="max-w-full max-h-full object-contain rounded"
            />
          )}

          {item.mediaType === 'audio' && (
            <div className="flex flex-col items-center justify-center p-4 w-full max-w-md text-center">
              <audio
                ref={mediaRef as any}
                src={fileUrl}
                autoPlay
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
              <div className="w-16 h-16 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mb-3 animate-pulse shadow-lg">
                <Volume2 className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-white mb-1 truncate max-w-xs">{item.name}</p>
              <span className="text-[10px] text-zinc-400 font-mono">Reproduzindo áudio...</span>
            </div>
          )}

          {item.mediaType === 'image' && (
            <img
              src={fileUrl}
              alt={item.name}
              className="max-w-full max-h-full object-contain"
            />
          )}

          {item.mediaType === 'font' && (
            <div className="w-full h-full flex flex-col p-3 overflow-y-auto space-y-3 bg-black/40 rounded-lg">
              <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Type className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{item.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">Tamanho:</span>
                  <input
                    type="range"
                    min={16}
                    max={84}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-24 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-emerald-300 w-8">{fontSize}px</span>
                </div>
              </div>

              <div className="flex-1 min-h-[160px] p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col">
                <textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  style={{ fontFamily: fontFamilyName, fontSize: `${fontSize}px` }}
                  placeholder="Digite qualquer texto para testar a fonte..."
                  className="w-full flex-1 bg-transparent text-white resize-none outline-none leading-tight selection:bg-emerald-500/40"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 shrink-0">
                <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">
                  Conjunto de Caracteres & Glifos
                </div>
                <div 
                  style={{ fontFamily: fontFamilyName }}
                  className="text-sm text-zinc-300 space-y-1 select-text"
                >
                  <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                  <p>abcdefghijklmnopqrstuvwxyz</p>
                  <p>0123456789 !@#$%^&*()_+-=[]{}|;:,.?</p>
                </div>
              </div>
            </div>
          )}

          {item.mediaType === 'mogrt' && (
            <div className="flex flex-col items-center justify-center p-4 text-center max-w-md max-h-full overflow-hidden">
              {item.thumbnailUrl ? (
                <div className="relative rounded-lg overflow-hidden shadow-xl border border-white/10 mb-2 max-h-[220px]">
                  <img src={item.thumbnailUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <Sparkles className="w-8 h-8" />
                </div>
              )}
              <h3 className="text-xs font-semibold text-white mb-0.5">{item.name}</h3>
              <p className="text-[10px] text-zinc-400">Template Gráfico MOGRT</p>
            </div>
          )}

          {item.mediaType === 'project' && (
            <div className="flex flex-col items-center justify-center p-4 text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-purple-600/30 text-purple-300 flex items-center justify-center mb-3 border border-purple-500/30 shadow-xl">
                <FileCode className="w-8 h-8" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">{item.name}</h3>
              <p className="text-[10px] text-zinc-400 mb-2">Projeto After Effects / Premiere</p>
              <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-300 truncate max-w-xs">
                {item.path}
              </div>
            </div>
          )}

          {item.mediaType === 'other' && (
            <div className="flex flex-col items-center justify-center p-4 text-center max-w-md">
              <div className="w-14 h-14 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center mb-2">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xs font-semibold text-white mb-0.5">{item.name}</h3>
              <p className="text-[10px] text-zinc-400">Arquivo ({item.extension})</p>
            </div>
          )}
        </div>

        {/* Video & Audio Controls */}
        {(item.mediaType === 'video' || item.mediaType === 'audio') && (
          <div className="p-2.5 border-t border-white/10 bg-black/60 flex flex-col gap-1.5 shrink-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                <span className="text-apple-accent font-semibold">{formatTime(currentTime)}</span>
                <div className="flex gap-2">
                  <span>IN: <strong className="text-white">{formatTime(inPoint)}</strong></span>
                  <span>OUT: <strong className="text-white">{formatTime(outPoint)}</strong></span>
                </div>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="relative h-2 bg-white/15 rounded-full cursor-pointer flex items-center">
                {duration > 0 && (
                  <div
                    className="absolute h-full bg-apple-accent/40 rounded-full"
                    style={{
                      left: `${(inPoint / duration) * 100}%`,
                      width: `${((outPoint - inPoint) / duration) * 100}%`
                    }}
                  />
                )}
                {duration > 0 && (
                  <div
                    className="absolute h-3 w-3 bg-white rounded-full shadow-lg -translate-x-1/2 pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                )}
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.01}
                  value={currentTime}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (mediaRef.current) mediaRef.current.currentTime = val;
                    setCurrentTime(val);
                  }}
                  className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={togglePlay}
                  className="p-1 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all"
                  title="Play / Pause"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    if (mediaRef.current) mediaRef.current.currentTime = inPoint;
                  }}
                  className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                  title="Voltar ao ponto IN"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-zinc-400 hover:text-white"
                    title={isMuted ? "Desmutar" : "Mutar"}
                  >
                    {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setIsMuted(false);
                      onVolumeChange(parseFloat(e.target.value));
                    }}
                    className="w-14 h-1 bg-white/20 rounded cursor-pointer accent-apple-accent"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded border border-white/5">
                <button
                  onClick={() => setInPoint(currentTime)}
                  className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-white/10 rounded"
                >
                  IN (I)
                </button>
                <button
                  onClick={() => setOutPoint(currentTime)}
                  className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 hover:text-white hover:bg-white/10 rounded"
                >
                  OUT (O)
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleImportBin}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] apple-button"
                >
                  <FolderPlus className="w-3 h-3 text-zinc-400" />
                  <span className="hidden xs:inline">Bin</span>
                </button>
                <button
                  onClick={handleInsertPlayhead}
                  disabled={isInserting}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium apple-button-accent"
                >
                  {insertSuccess ? <CheckCircle2 className="w-3 h-3 text-emerald-300" /> : <PlusCircle className="w-3 h-3" />}
                  <span>{insertSuccess ? 'Inserido!' : isInserting ? '...' : 'Inserir'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer for Non-Video/Audio items */}
        {item.mediaType !== 'video' && item.mediaType !== 'audio' && (
          <div className="p-2 border-t border-white/10 bg-black/60 flex items-center justify-end gap-1.5 shrink-0">
            <button
              onClick={handleImportBin}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs apple-button"
            >
              <FolderPlus className="w-3 h-3 text-zinc-400" />
              <span>Importar ao Bin</span>
            </button>
            <button
              onClick={handleInsertPlayhead}
              className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium apple-button-accent"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Inserir na Timeline</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
