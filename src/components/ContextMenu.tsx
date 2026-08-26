import React, { useEffect, useRef } from 'react';
import { 
  Star, 
  Eye, 
  PlusCircle, 
  FolderOpen, 
  FolderTree,
  Copy, 
  Tag, 
  Check, 
  X
} from 'lucide-react';
import { FileItem } from '../types';
import { LABEL_COLORS } from '../constants/colors';
import { fileSystemService } from '../services/fileSystemService';
import { premiereService } from '../services/premiereService';

interface ContextMenuProps {
  x: number;
  y: number;
  item: FileItem;
  onClose: () => void;
  onToggleStar: (item: FileItem) => void;
  onQuickLook: (item: FileItem) => void;
  onSetLabelColor: (item: FileItem, colorId: string | null) => void;
  onNavigateToParentFolder?: (path: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  onClose,
  onToggleStar,
  onQuickLook,
  onSetLabelColor,
  onNavigateToParentFolder
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const adjustedX = Math.min(x, window.innerWidth - 210);
  const adjustedY = Math.min(y, window.innerHeight - 240);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(item.path);
    onClose();
  };

  const handleInsertTimeline = async () => {
    await premiereService.insertAtPlayhead(item.path);
    onClose();
  };

  const handleReveal = () => {
    fileSystemService.revealInExplorer(item.path);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-52 glass-quicklook bg-black/90 border border-white/20 rounded-2xl shadow-2xl p-1.5 text-xs select-none animate-scale-in flex flex-col gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with Name */}
      <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 truncate border-b border-white/10">
        {item.name}
      </div>

      {/* Label Colors Bar */}
      <div className="px-2 py-1.5">
        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
          <span>Cor / Label</span>
          {item.labelColor && (
            <button
              onClick={() => {
                onSetLabelColor(item, null);
                onClose();
              }}
              className="text-[9px] text-zinc-400 hover:text-rose-400 flex items-center gap-0.5"
            >
              <X className="w-2.5 h-2.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Color Palette Dots */}
        <div className="flex items-center justify-between gap-1">
          {LABEL_COLORS.map((c) => {
            const isSelected = item.labelColor === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onSetLabelColor(item, isSelected ? null : c.id);
                  onClose();
                }}
                style={{ backgroundColor: c.dot }}
                className={`w-4 h-4 rounded-full transition-transform hover:scale-125 flex items-center justify-center shadow-md ${
                  isSelected ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                title={c.name}
              >
                {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-white/10 my-0.5" />

      {/* Quick Actions */}
      {!item.isDirectory && (
        <>
          <button
            onClick={handleInsertTimeline}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-accent transition-colors text-left"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Inserir na Timeline</span>
          </button>

          <button
            onClick={() => {
              onQuickLook(item);
              onClose();
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 transition-colors text-left"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>QuickLook (Espaço)</span>
          </button>
        </>
      )}

      {/* Star Action */}
      <button
        onClick={() => {
          onToggleStar(item);
          onClose();
        }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 transition-colors text-left"
      >
        <Star className={`w-3.5 h-3.5 ${item.isStarred ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
        <span>{item.isStarred ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</span>
      </button>

      {/* System Actions */}
      {onNavigateToParentFolder && (
        <button
          onClick={() => {
            const sepIdx = Math.max(item.path.lastIndexOf('\\'), item.path.lastIndexOf('/'));
            if (sepIdx > 0) {
              const parentPath = item.path.slice(0, sepIdx);
              onNavigateToParentFolder(parentPath);
            }
            onClose();
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 transition-colors text-left"
        >
          <FolderTree className="w-3.5 h-3.5 text-sky-400" />
          <span>Ir para a Pasta</span>
        </button>
      )}

      <button
        onClick={handleReveal}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 transition-colors text-left"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        <span>Abrir no Explorer</span>
      </button>

      <button
        onClick={handleCopyPath}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 transition-colors text-left"
      >
        <Copy className="w-3.5 h-3.5" />
        <span>Copiar Caminho</span>
      </button>
    </div>
  );
};
