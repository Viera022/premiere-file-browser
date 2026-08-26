import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  HardDrive, 
  Cloud, 
  Star, 
  ChevronRight, 
  ChevronDown, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Plus, 
  Trash2,
  Film,
  Music,
  Type,
  Layers,
  Sparkles,
  Download,
  Flame,
  Image as ImageIcon,
  Palette,
  Mic,
  Volume2,
  Disc,
  Radio,
  Headphones,
  Clapperboard,
  Video,
  Wand2,
  Zap,
  Box,
  Crop,
  Smile,
  Tag,
  Archive,
  Bookmark,
  Briefcase,
  Trophy,
  Code,
  Sliders,
  Shield,
  Heart,
  FolderHeart,
  Settings,
  Sun,
  Moon,
  Tv
} from 'lucide-react';
import { CustomLibrary, DriveItem, ThemeMode } from '../types';
import { Language, getTranslation } from '../i18n/translations';
import { fileSystemService } from '../services/fileSystemService';
import { PremiereLogo } from './PremiereLogo';

interface SidebarProps {
  currentPath: string;
  isFavoritesView: boolean;
  favoritesCount: number;
  customLibraries: CustomLibrary[];
  isCollapsed: boolean;
  width: number;
  themeMode: ThemeMode;
  language?: Language;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onWidthChange: (w: number) => void;
  onToggleCollapse: () => void;
  onSelectPath: (path: string) => void;
  onSelectFavoritesView: () => void;
  onOpenAddLibraryModal: () => void;
  onDeleteLibrary: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  isFavoritesView,
  favoritesCount,
  customLibraries,
  isCollapsed,
  width,
  themeMode,
  language = 'pt',
  onToggleTheme,
  onOpenSettings,
  onWidthChange,
  onToggleCollapse,
  onSelectPath,
  onSelectFavoritesView,
  onOpenAddLibraryModal,
  onDeleteLibrary
}) => {
  const t = getTranslation(language);
  const [drives] = useState<DriveItem[]>(() => fileSystemService.getDrives());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [treeData, setTreeData] = useState<Map<string, { name: string; path: string }[]>>(new Map());
  const [isResizing, setIsResizing] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      const newWidth = Math.max(140, Math.min(480, e.clientX));
      if (newWidth < 90) {
        if (!isCollapsed) onToggleCollapse();
      } else {
        if (isCollapsed) onToggleCollapse();
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isCollapsed, onToggleCollapse, onWidthChange]);

  const toggleExpand = async (itemPath: string) => {
    const next = new Set(expandedPaths);
    if (next.has(itemPath)) {
      next.delete(itemPath);
    } else {
      next.add(itemPath);
      if (!treeData.has(itemPath)) {
        const subs = await fileSystemService.listSubdirectories(itemPath);
        setTreeData(new Map(treeData.set(itemPath, subs)));
      }
    }
    setExpandedPaths(next);
  };

  const getLibraryIcon = (iconName: string) => {
    switch (iconName) {
      case 'music': return <Music className="w-3.5 h-3.5 text-pink-400" />;
      case 'film': return <Film className="w-3.5 h-3.5 text-sky-400" />;
      case 'sparkles': return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'type': return <Type className="w-3.5 h-3.5 text-emerald-400" />;
      case 'layers': return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'download': return <Download className="w-3.5 h-3.5 text-teal-400" />;
      case 'star': return <Star className="w-3.5 h-3.5 text-yellow-400" />;
      case 'flame': return <Flame className="w-3.5 h-3.5 text-rose-500" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-blue-300" />;
      case 'palette': return <Palette className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'mic': return <Mic className="w-3.5 h-3.5 text-emerald-400" />;
      case 'volume2': return <Volume2 className="w-3.5 h-3.5 text-rose-400" />;
      case 'headphones': return <Headphones className="w-3.5 h-3.5 text-violet-400" />;
      case 'disc': return <Disc className="w-3.5 h-3.5 text-amber-300" />;
      case 'radio': return <Radio className="w-3.5 h-3.5 text-teal-400" />;
      case 'clapperboard': return <Clapperboard className="w-3.5 h-3.5 text-blue-400" />;
      case 'video': return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case 'wand2': return <Wand2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'zap': return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'box': return <Box className="w-3.5 h-3.5 text-amber-500" />;
      case 'crop': return <Crop className="w-3.5 h-3.5 text-sky-300" />;
      case 'smile': return <Smile className="w-3.5 h-3.5 text-yellow-300" />;
      case 'tag': return <Tag className="w-3.5 h-3.5 text-indigo-400" />;
      case 'archive': return <Archive className="w-3.5 h-3.5 text-zinc-400" />;
      case 'bookmark': return <Bookmark className="w-3.5 h-3.5 text-orange-400" />;
      case 'briefcase': return <Briefcase className="w-3.5 h-3.5 text-amber-400" />;
      case 'trophy': return <Trophy className="w-3.5 h-3.5 text-yellow-500" />;
      case 'code': return <Code className="w-3.5 h-3.5 text-green-400" />;
      case 'sliders': return <Sliders className="w-3.5 h-3.5 text-blue-400" />;
      case 'shield': return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
      case 'heart': return <Heart className="w-3.5 h-3.5 text-pink-500" />;
      case 'folder-heart': return <FolderHeart className="w-3.5 h-3.5 text-rose-400" />;
      case 'tv': return <Tv className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <Folder className="w-3.5 h-3.5 text-apple-accent" />;
    }
  };

  // Separation of Local Disks vs Cloud Storages
  const localDrives = drives.filter(d => d.type === 'local_drive');
  const cloudDrives = drives.filter(d => d.type === 'cloud_drive');

  const localLibraries = customLibraries.filter(lib => !fileSystemService.isCloudPath(lib.path));
  const cloudLibraries = customLibraries.filter(lib => fileSystemService.isCloudPath(lib.path));

  return (
    <aside 
      ref={sidebarRef}
      style={{ width: isCollapsed ? 56 : width }}
      className="relative flex flex-col border-r border-white/10 glass-panel shrink-0 select-none transition-all duration-75"
    >
      {/* Header with Pixel-Perfect Premiere Pro (Pr) Logo & Collapse */}
      <div className={`p-2.5 border-b border-white/10 flex items-center shrink-0 ${
        isCollapsed ? 'justify-center' : 'justify-between gap-2 overflow-hidden'
      }`}>
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
            title="Expandir Barra Lateral"
          >
            <PremiereLogo className="w-5 h-5" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <PremiereLogo className="w-5 h-5" />
              <span className="font-bold text-xs tracking-wider text-white uppercase truncate">
                {t.explorerTitle}
              </span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={onOpenSettings}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Configurações"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onToggleTheme}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title={themeMode === 'dark' ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
              >
                {themeMode === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                )}
              </button>

              <button
                onClick={onToggleCollapse}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Recolher Barra Lateral"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        {/* ⭐ Favorites Section */}
        <div>
          <button
            onClick={onSelectFavoritesView}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all group ${
              isFavoritesView 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md' 
                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
            }`}
            title={t.sideFavorites}
          >
            <Star className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              isFavoritesView ? 'fill-amber-400 text-amber-400' : 'text-amber-400'
            }`} />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="truncate">{t.sideFavorites}</span>
                {favoritesCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-bold">
                    {favoritesCount}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>

        {/* 🗂️ Minhas Bibliotecas (Custom Folders) */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-apple-textMuted uppercase tracking-wider">
                {t.sideMyLibs}
              </span>
              <button
                onClick={onOpenAddLibraryModal}
                className="p-0.5 rounded hover:bg-white/10 text-apple-accent hover:text-white transition-colors"
                title="Adicionar Biblioteca"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-0.5">
            {localLibraries.map((lib) => {
              const isSelected = !isFavoritesView && currentPath === lib.path;
              return (
                <div
                  key={lib.id}
                  className={`group/item flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-apple-accent text-white shadow-sm'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => onSelectPath(lib.path)}
                  title={lib.path}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="shrink-0">{getLibraryIcon(lib.icon)}</span>
                    {!isCollapsed && <span className="truncate">{lib.name}</span>}
                  </div>

                  {!isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLibrary(lib.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded transition-all"
                      title="Remover Biblioteca"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {localLibraries.length === 0 && !isCollapsed && (
              <button
                onClick={onOpenAddLibraryModal}
                className="w-full p-2 rounded-xl border border-dashed border-white/15 hover:border-apple-accent/60 bg-white/[0.02] hover:bg-apple-accent/5 text-center text-zinc-400 hover:text-white transition-all group"
              >
                <Sparkles className="w-3.5 h-3.5 mx-auto mb-0.5 text-apple-accent group-hover:scale-110 transition-transform" />
                <div className="text-[10px] font-semibold text-zinc-200">Adicionar Pastas</div>
              </button>
            )}
          </div>
        </div>

        {/* 💾 Discos Locais */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold text-apple-textMuted uppercase tracking-wider">
              {t.sideLocalDrives}
            </div>
          )}

          <div className="space-y-0.5">
            {localDrives.map((drive) => {
              const isSelected = !isFavoritesView && currentPath === drive.path;
              const isExpanded = expandedPaths.has(drive.path);
              const subs = treeData.get(drive.path) || [];

              return (
                <div key={drive.id}>
                  <div
                    onClick={() => onSelectPath(drive.path)}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-apple-accent text-white shadow-sm'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                    title={drive.path}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {!isCollapsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(drive.path);
                          }}
                          className="text-zinc-500 hover:text-white p-0.5"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                      <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      {!isCollapsed && <span className="truncate">{drive.name}</span>}
                    </div>
                  </div>

                  {!isCollapsed && isExpanded && (
                    <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-white/5 ml-3.5 my-0.5">
                      {subs.map((sub) => {
                        const isSubSelected = !isFavoritesView && currentPath === sub.path;
                        return (
                          <div
                            key={sub.path}
                            onClick={() => onSelectPath(sub.path)}
                            className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs cursor-pointer truncate transition-colors ${
                              isSubSelected
                                ? 'bg-apple-accent text-white font-medium shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                            title={sub.path}
                          >
                            <Folder className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate">{sub.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ☁️ Armazenamento em Nuvem */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-bold text-apple-textMuted uppercase tracking-wider">
              {t.sideCloudDrives}
            </div>
          )}

          <div className="space-y-0.5">
            {cloudDrives.map((drive) => {
              const isSelected = !isFavoritesView && currentPath === drive.path;
              const isExpanded = expandedPaths.has(drive.path);
              const subs = treeData.get(drive.path) || [];

              return (
                <div key={drive.id}>
                  <div
                    onClick={() => onSelectPath(drive.path)}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-apple-accent text-white shadow-sm'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                    title={drive.path}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {!isCollapsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(drive.path);
                          }}
                          className="text-zinc-500 hover:text-white p-0.5"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                      <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {!isCollapsed && <span className="truncate">{drive.name}</span>}
                    </div>
                  </div>

                  {!isCollapsed && isExpanded && (
                    <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-white/5 ml-3.5 my-0.5">
                      {subs.map((sub) => {
                        const isSubSelected = !isFavoritesView && currentPath === sub.path;
                        return (
                          <div
                            key={sub.path}
                            onClick={() => onSelectPath(sub.path)}
                            className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs cursor-pointer truncate transition-colors ${
                              isSubSelected
                                ? 'bg-apple-accent text-white font-medium shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                            title={sub.path}
                          >
                            <Folder className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{sub.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Libraries that are inside cloud storage */}
            {cloudLibraries.map((lib) => {
              const isSelected = !isFavoritesView && currentPath === lib.path;
              return (
                <div
                  key={lib.id}
                  className={`group/item flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-apple-accent text-white shadow-sm'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => onSelectPath(lib.path)}
                  title={lib.path}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {!isCollapsed && <span className="truncate">{lib.name}</span>}
                  </div>

                  {!isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLibrary(lib.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded transition-all"
                      title="Remover Biblioteca"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={onOpenAddLibraryModal}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl apple-button text-xs font-medium text-zinc-300 hover:text-white"
          title={t.sideNewLib}
        >
          <Plus className="w-3.5 h-3.5 text-apple-accent" />
          {!isCollapsed && <span>{t.sideNewLib}</span>}
        </button>
      </div>

      {/* Draggable Resizer */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        onDoubleClick={onToggleCollapse}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-apple-accent/50 transition-colors z-30"
        title="Arraste para redimensionar"
      />
    </aside>
  );
};
