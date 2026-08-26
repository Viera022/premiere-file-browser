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
  ZoomOut,
  FolderTree,
  Loader2,
  X,
  Film,
  Music,
  ImageIcon,
  Sparkles,
  Type
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
  isRecursiveSearch?: boolean;
  onToggleRecursiveSearch?: () => void;
  isSearchingRecursive?: boolean;
  recursiveMatchCount?: number;
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
  gridSize = 140,
  onGridSizeChange,
  isRecursiveSearch = false,
  onToggleRecursiveSearch,
  isSearchingRecursive = false,
  recursiveMatchCount = 0
}) => {
  const isFavorites = currentPath === '⭐ Meus Favoritos';
  const isHome = currentPath === '🏠 Início';
  const pathParts = isFavorites ? ['⭐ Meus Favoritos'] : isHome ? ['🏠 Início'] : currentPath.split(/\\|\//).filter(Boolean);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const filterTabs: { id: MediaFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tudo', icon: null },
    { id: 'starred', label: 'Favoritos', icon: <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> },
    { id: 'video', label: 'Vídeos', icon: <Film className="w-3 h-3 text-sky-400" /> },
    { id: 'audio', label: 'SFX & Áudio', icon: <Music className="w-3 h-3 text-pink-400" /> },
    { id: 'image', label: 'Imagens', icon: <ImageIcon className="w-3 h-3 text-emerald-400" /> },
    { id: 'mogrt', label: 'MOGRTs', icon: <Sparkles className="w-3 h-3 text-purple-400" /> },
    { id: 'font', label: 'Fontes', icon: <Type className="w-3 h-3 text-amber-400" /> },
  ];

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-3.5 h-3.5 text-rose-400" />;
    if (volume < 0.4) return <Volume1 className="w-3.5 h-3.5 text-zinc-300" />;
    return <Volume2 className="w-3.5 h-3.5 text-zinc-200" />;
  };

  return (
    <header className="px-3 py-2 border-b border-white/10 bg-[#141416] flex flex-col gap-2 shrink-0 select-none">
      {/* Row 1: Navigation + Breadcrumbs + Tools */}
      <div className="flex items-center justify-between gap-2 h-7">
        {/* Left: Navigation Buttons + Path */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Home Button */}
          <button
            onClick={onNavigateHome}
            className={`w-7 h-7 rounded-lg border text-zinc-300 hover:text-white inline-flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isHome ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-sm' : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
            title="Início / Home (Pasta Raiz)"
          >
            <Home className="w-3.5 h-3.5 text-sky-400" />
          </button>

          {/* Back Up Button */}
          <button
            onClick={onNavigateUp}
            disabled={!canNavigateUp}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white inline-flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Voltar Pasta Acima"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white inline-flex items-center justify-center shrink-0 transition-all cursor-pointer"
            title="Atualizar Pasta (F5)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Breadcrumbs Path */}
          <div className="flex items-center gap-1 text-xs text-zinc-400 overflow-x-auto no-scrollbar py-0.5 ml-1 flex-1 min-w-0">
            {isHome ? (
              <span className="font-semibold text-sky-400 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/20 shrink-0">
                <Home className="w-3 h-3 text-sky-400" />
                <span>Início</span>
              </span>
            ) : isFavorites ? (
              <span className="font-semibold text-amber-300 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Meus Favoritos</span>
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
                      className={`hover:text-white transition-colors truncate max-w-[140px] font-medium shrink-0 cursor-pointer ${
                        isLast ? 'text-white font-semibold' : 'text-zinc-400'
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
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Zoom Slider for Grid Cards */}
          {viewMode === 'grid' && !isHome && (
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/10 h-7 animate-fade-in" title="Tamanho das Miniaturas">
              <button 
                onClick={() => onGridSizeChange(Math.max(100, gridSize - 20))}
                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
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
                className="w-14 h-1 bg-white/20 rounded cursor-pointer accent-accent"
              />
              <button 
                onClick={() => onGridSizeChange(Math.min(240, gridSize + 20))}
                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                title="Aumentar Miniaturas"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Volume Slider */}
          <div 
            className="relative inline-flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={() => onVolumeChange(volume === 0 ? 0.75 : 0)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 inline-flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
              title={`Volume da Preview: ${Math.round(volume * 100)}%`}
            >
              {getVolumeIcon()}
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 top-full pt-1 z-30 animate-fade-in">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl shadow-xl border border-white/15 bg-black/95">
                  <span className="text-[10px] font-mono text-zinc-300 w-7">{Math.round(volume * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1.5 bg-white/20 rounded-lg cursor-pointer accent-accent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* View Mode Switcher */}
          {!isHome && (
            <div className="inline-flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 h-7 animate-fade-in">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Grade"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Search Input + Filter Tabs */}
      <div className="flex items-center justify-between gap-2 h-7">
        {/* Search Bar with Recursive Button */}
        <div className="relative flex-1 max-w-xs flex items-center min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isRecursiveSearch ? "Buscar tudo..." : "Buscar..."}
            className={`w-full h-7 pl-8 pr-14 text-xs rounded-lg bg-white/5 border text-white placeholder-zinc-500 focus:outline-none transition-all ${
              isRecursiveSearch 
                ? 'border-accent/60 bg-accent/5 focus:border-accent shadow-[0_0_10px_rgba(10,132,255,0.15)]' 
                : 'border-white/10 focus:border-accent'
            }`}
          />

          {/* Clear Search button */}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-7 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-white cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Recursive Search Toggle Button */}
          <button
            onClick={onToggleRecursiveSearch}
            className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all flex items-center justify-center cursor-pointer ${
              isRecursiveSearch
                ? 'bg-accent text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
            title={isRecursiveSearch ? "Busca Recursiva ATIVA (Varrendo subpastas) — Clique para desativar" : "Ativar Busca Recursiva (Varre todas as subpastas)"}
          >
            {isSearchingRecursive ? (
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            ) : (
              <FolderTree className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Recursive Results Live Counter */}
        {isRecursiveSearch && searchQuery && (
          <div className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent font-semibold flex items-center gap-1 shrink-0 animate-fade-in">
            {isSearchingRecursive && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />}
            <span>{recursiveMatchCount} {recursiveMatchCount === 1 ? 'item' : 'itens'}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 shrink-0 ml-auto">
          {filterTabs.map((tab) => {
            const isActive = mediaFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onMediaFilterChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 select-none cursor-pointer ${
                  isActive
                    ? 'bg-accent text-white shadow-sm font-semibold'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
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
