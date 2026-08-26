import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  RotateCw, 
  Home,
  Search, 
  Grid, 
  List, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Star, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';
import { MediaFilter, SortOption, SortOrder, ViewMode } from '../types';

interface ToolbarProps {
  currentPath: string;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onNavigatePath: (path: string) => void;
  onNavigateHome: () => void;
  onNavigateUp: () => void;
  onRefresh: () => void;
  canNavigateUp: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  mediaFilter: MediaFilter;
  onMediaFilterChange: (f: MediaFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  sortOption: SortOption;
  sortOrder: SortOrder;
  onSortChange: (opt: SortOption) => void;
  gridSize: number;
  onGridSizeChange: (s: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPath,
  volume = 0.75,
  onVolumeChange,
  onNavigatePath,
  onNavigateHome,
  onNavigateUp,
  onRefresh,
  canNavigateUp,
  searchQuery,
  onSearchChange,
  mediaFilter,
  onMediaFilterChange,
  viewMode,
  onViewModeChange,
  sortOption,
  sortOrder,
  onSortChange,
  gridSize = 140,
  onGridSizeChange
}) => {
  const isFavorites = currentPath === '⭐ Meus Favoritos';
  const pathParts = isFavorites ? ['⭐ Meus Favoritos'] : currentPath.split(/\\|\//).filter(Boolean);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const filterTabs: { id: MediaFilter; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'Tudo' },
    { id: 'starred', label: 'Favoritos', icon: <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> },
    { id: 'video', label: 'Vídeos' },
    { id: 'audio', label: 'SFX & Áudio' },
    { id: 'image', label: 'Imagens' },
    { id: 'mogrt', label: 'MOGRTs' },
    { id: 'font', label: 'Fontes' },
  ];

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-3.5 h-3.5 text-rose-400" />;
    if (volume < 0.4) return <Volume1 className="w-3.5 h-3.5 text-zinc-300" />;
    return <Volume2 className="w-3.5 h-3.5 text-zinc-200" />;
  };

  return (
    <header className="px-3 py-2 border-b border-white/10 glass-panel flex flex-col gap-2 shrink-0 select-none">
      {/* Row 1: Navigation + Breadcrumbs + Tools */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Home Button */}
          <button
            onClick={onNavigateHome}
            className="p-1 rounded-lg apple-button text-zinc-300 hover:text-white flex items-center justify-center"
            title="Início / Home (Pasta Raiz)"
          >
            <Home className="w-3.5 h-3.5 text-sky-400" />
          </button>

          {/* Back Up Button */}
          <button
            onClick={onNavigateUp}
            disabled={!canNavigateUp}
            className="p-1 rounded-lg apple-button disabled:opacity-30 disabled:pointer-events-none"
            title="Voltar Pasta Acima"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-1 rounded-lg apple-button"
            title="Atualizar Pasta (F5)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-xs text-zinc-400 overflow-x-auto no-scrollbar py-0.5 ml-1">
            {isFavorites ? (
              <span className="font-semibold text-amber-300 flex items-center gap-1">
                ⭐ Meus Favoritos
              </span>
            ) : (
              pathParts.map((part, index) => {
                const subPath = pathParts.slice(0, index + 1).join('\\');
                const isLast = index === pathParts.length - 1;

                return (
                  <React.Fragment key={subPath}>
                    {index > 0 && <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />}
                    <button
                      onClick={() => onNavigatePath(subPath)}
                      className={`hover:text-white transition-colors truncate max-w-[120px] font-medium ${
                        isLast ? 'text-white font-semibold' : ''
                      }`}
                    >
                      {part.length === 2 && part.endsWith(':') ? `${part}\\` : part}
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* Right Tools: Zoom Slider + Volume + View Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom Slider for Grid Cards */}
          {viewMode === 'grid' && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/5" title="Tamanho das Miniaturas">
              <button 
                onClick={() => onGridSizeChange(Math.max(100, gridSize - 20))}
                className="text-zinc-400 hover:text-white p-0.5"
                title="Diminuir Miniaturas"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <input
                type="range"
                min="100"
                max="240"
                step="5"
                value={gridSize}
                onChange={(e) => onGridSizeChange(Number(e.target.value))}
                className="w-14 h-1 bg-white/20 rounded cursor-pointer accent-apple-accent"
              />
              <button 
                onClick={() => onGridSizeChange(Math.min(240, gridSize + 20))}
                className="text-zinc-400 hover:text-white p-0.5"
                title="Aumentar Miniaturas"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Volume Slider */}
          <div 
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={() => onVolumeChange(volume === 0 ? 0.75 : 0)}
              className="p-1 rounded-lg apple-button flex items-center justify-center text-zinc-400 hover:text-white"
              title={`Volume da Preview: ${Math.round(volume * 100)}%`}
            >
              {getVolumeIcon()}
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 top-full pt-1 z-30 animate-fade-in">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl glass-quicklook shadow-xl border border-white/15 bg-black/90">
                  <span className="text-[10px] font-mono text-zinc-300 w-7">{Math.round(volume * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1.5 bg-white/20 rounded-lg cursor-pointer accent-apple-accent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização em Grade"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Search + Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[130px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-apple-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {filterTabs.map((tab) => {
            const isActive = mediaFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onMediaFilterChange(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-apple-accent text-white shadow-sm'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
