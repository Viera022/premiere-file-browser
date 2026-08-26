import React, { useState, useEffect, useRef } from 'react';
import { FileItem } from '../types';
import { FileCard } from './FileCard';

interface FileGridProps {
  items: FileItem[];
  selectedItem: FileItem | null;
  volume: number;
  gridSize?: number;
  hoverScrubEnabled?: boolean;
  onSelect: (item: FileItem) => void;
  onOpen: (item: FileItem) => void;
  onQuickLook: (item: FileItem) => void;
  onToggleStar: (item: FileItem) => void;
  onContextMenu?: (e: React.MouseEvent, item: FileItem) => void;
}

const CHUNK_SIZE = 80;

export const FileGrid: React.FC<FileGridProps> = ({
  items,
  selectedItem,
  volume,
  gridSize = 140,
  hoverScrubEnabled = false,
  onSelect,
  onOpen,
  onQuickLook,
  onToggleStar,
  onContextMenu
}) => {
  const [renderedCount, setRenderedCount] = useState(CHUNK_SIZE);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset rendered count when folder items change
  useEffect(() => {
    setRenderedCount(CHUNK_SIZE);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 300) {
      if (renderedCount < items.length) {
        setRenderedCount(prev => Math.min(items.length, prev + CHUNK_SIZE));
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
        <p className="text-xs">Nenhum arquivo ou pasta encontrado.</p>
      </div>
    );
  }

  const visibleItems = items.slice(0, renderedCount);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-2 select-none"
    >
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`,
          gap: '8px'
        }}
      >
        {visibleItems.map((item) => (
          <FileCard
            key={item.path}
            item={item}
            isSelected={selectedItem?.path === item.path}
            isStarred={item.isStarred}
            volume={volume}
            gridSize={gridSize}
            hoverScrubEnabled={Boolean(hoverScrubEnabled)}
            onSelect={onSelect}
            onOpen={onOpen}
            onQuickLook={onQuickLook}
            onToggleStar={onToggleStar}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>

      {renderedCount < items.length && (
        <div className="w-full py-4 text-center text-[10px] text-zinc-500 font-mono">
          Exibindo {renderedCount} de {items.length} itens... (Role para carregar mais)
        </div>
      )}
    </div>
  );
};
