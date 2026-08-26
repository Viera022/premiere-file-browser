import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { FileGrid } from './components/FileGrid';
import { FileList } from './components/FileList';
import { HomeScreen } from './components/HomeScreen';
import { QuickLookModal } from './components/QuickLookModal';
import { AddLibraryModal } from './components/AddLibraryModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ContextMenu } from './components/ContextMenu';
import { FileItem, MediaFilter, SortOption, SortOrder, ViewMode, CustomLibrary, ThemeMode, ContextMenuState } from './types';
import { Language } from './i18n/translations';
import { fileSystemService } from './services/fileSystemService';
import { premiereService } from './services/premiereService';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const saved = localStorage.getItem('filebrowser_last_path');
    if (saved) return saved;
    const drives = fileSystemService.getDrives();
    return drives[0] ? drives[0].path : fileSystemService.getDownloadsPath();
  });

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('filebrowser_sidebar_width');
    return saved ? Math.max(140, Math.min(450, parseInt(saved, 10))) : 220;
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('filebrowser_theme') as ThemeMode) || 'dark';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('filebrowser_language') as Language) || 'pt';
  });

  const [hoverScrubEnabled, setHoverScrubEnabled] = useState<boolean>(() => {
    return localStorage.getItem('filebrowser_hover_scrub') === 'true';
  });

  const [hwAccelEnabled, setHwAccelEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('filebrowser_hw_accel');
    return saved !== null ? saved === 'true' : true;
  });

  const [previewVolume, setPreviewVolume] = useState<number>(() => {
    const saved = localStorage.getItem('filebrowser_preview_volume');
    return saved ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.75;
  });

  const [gridSize, setGridSize] = useState<number>(() => {
    const saved = localStorage.getItem('filebrowser_grid_size');
    return saved ? Math.max(100, Math.min(240, parseInt(saved, 10))) : 140;
  });

  const [customLibraries, setCustomLibraries] = useState<CustomLibrary[]>(() => {
    return fileSystemService.getCustomLibraries();
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('filebrowser_onboarding_completed');
  });

  const [isAddLibModalOpen, setIsAddLibModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isFavoritesView, setIsFavoritesView] = useState(false);
  const [isHomeView, setIsHomeView] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [quickLookItem, setQuickLookItem] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timelineFeedback, setTimelineFeedback] = useState<string | null>(null);

  // Request counter to cancel stale background loads
  const loadRequestIdRef = useRef(0);

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const updateFavoritesCount = useCallback(() => {
    const starred = fileSystemService.getStarredPaths();
    setFavoritesCount(starred.size);
  }, []);

  const loadDirectory = useCallback((targetPath: string, force = false) => {
    const reqId = ++loadRequestIdRef.current;
    setIsLoading(true);
    setIsFavoritesView(false);
    setIsHomeView(false);

    fileSystemService.listDirectory(targetPath, force)
      .then((items) => {
        if (reqId === loadRequestIdRef.current) {
          setFiles(items || []);
          setSelectedItem(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (reqId === loadRequestIdRef.current) {
          setFiles([]);
          setIsLoading(false);
        }
      })
      .finally(() => {
        if (reqId === loadRequestIdRef.current) {
          updateFavoritesCount();
        }
      });
  }, [updateFavoritesCount]);

  const loadFavorites = useCallback(() => {
    const reqId = ++loadRequestIdRef.current;
    setIsLoading(true);
    setIsFavoritesView(true);
    setIsHomeView(false);

    fileSystemService.getStarredFileItems()
      .then((items) => {
        if (reqId === loadRequestIdRef.current) {
          setFiles(items || []);
          setSelectedItem(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (reqId === loadRequestIdRef.current) {
          setFiles([]);
          setIsLoading(false);
        }
      })
      .finally(() => {
        if (reqId === loadRequestIdRef.current) {
          updateFavoritesCount();
        }
      });
  }, [updateFavoritesCount]);

  useEffect(() => {
    if (isHomeView) {
      loadRequestIdRef.current++;
      setIsLoading(false);
      updateFavoritesCount();
    } else if (isFavoritesView) {
      loadFavorites();
    } else {
      loadDirectory(currentPath);
      localStorage.setItem('filebrowser_last_path', currentPath);
    }
  }, [currentPath, isFavoritesView, isHomeView, loadDirectory, loadFavorites, updateFavoritesCount]);

  const handleSidebarWidthChange = (w: number) => {
    setSidebarWidth(w);
    localStorage.setItem('filebrowser_sidebar_width', w.toString());
  };

  const handleGridSizeChange = (s: number) => {
    const clamped = Math.max(100, Math.min(240, s));
    setGridSize(clamped);
    localStorage.setItem('filebrowser_grid_size', clamped.toString());
  };

  const handleVolumeChange = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setPreviewVolume(clamped);
    localStorage.setItem('filebrowser_preview_volume', clamped.toString());
  };

  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    localStorage.setItem('filebrowser_theme', nextTheme);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('filebrowser_language', lang);
  };

  const handleToggleHoverScrub = () => {
    const nextVal = !hoverScrubEnabled;
    setHoverScrubEnabled(nextVal);
    localStorage.setItem('filebrowser_hover_scrub', nextVal ? 'true' : 'false');
  };

  const handleToggleHwAccel = () => {
    const nextVal = !hwAccelEnabled;
    setHwAccelEnabled(nextVal);
    localStorage.setItem('filebrowser_hw_accel', nextVal ? 'true' : 'false');
  };

  const handleAddLibrary = (lib: Omit<CustomLibrary, 'id'>) => {
    const created = fileSystemService.addCustomLibrary(lib);
    setCustomLibraries(prev => [...prev, created]);
    setCurrentPath(created.path);
    setIsFavoritesView(false);
    setIsHomeView(false);
  };

  const handleDeleteLibrary = (id: string) => {
    fileSystemService.removeCustomLibrary(id);
    setCustomLibraries(prev => prev.filter(l => l.id !== id));
  };

  const handleToggleStar = (item: FileItem) => {
    const newState = fileSystemService.toggleStar(item.path);
    item.isStarred = newState;
    setFiles(prev => prev.map(f => f.path === item.path ? { ...f, isStarred: newState } : f));
    updateFavoritesCount();
    if (isFavoritesView && !newState) {
      setFiles(prev => prev.filter(f => f.path !== item.path));
    }
  };

  const handleSetLabelColor = (item: FileItem, colorId: string | null) => {
    fileSystemService.setItemLabel(item.path, colorId);
    item.labelColor = colorId || undefined;
    setFiles(prev => prev.map(f => f.path === item.path ? { ...f, labelColor: colorId || undefined } : f));
  };

  const handleOpenContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleNavigateHome = () => {
    loadRequestIdRef.current++;
    setIsLoading(false);
    setIsHomeView(true);
    setIsFavoritesView(false);
  };

  const handleOnboardingComplete = (_userName: string, selectedLang: Language) => {
    setIsOnboardingOpen(false);
    setLanguage(selectedLang);
    handleNavigateHome();
  };

  const filteredItems = useMemo(() => {
    if (isHomeView) return [];
    return files
      .filter((item) => {
        if (mediaFilter === 'starred') {
          if (!item.isStarred) return false;
        } else if (mediaFilter !== 'all' && !item.isDirectory && item.mediaType !== mediaFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        let result = 0;
        if (sortOption === 'name') result = a.name.localeCompare(b.name);
        else if (sortOption === 'date') result = a.modifiedTime - b.modifiedTime;
        else if (sortOption === 'size') result = a.size - b.size;

        return sortOrder === 'asc' ? result : -result;
      });
  }, [files, mediaFilter, searchQuery, sortOption, sortOrder, isHomeView]);

  const handleNavigateUp = useCallback(() => {
    const parts = currentPath.split(/\\|\//).filter(Boolean);
    if (parts.length > 1) {
      parts.pop();
      const parent = parts.join('\\');
      setIsHomeView(false);
      setCurrentPath(parent);
    }
  }, [currentPath]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        if (selectedItem && !selectedItem.isDirectory) {
          e.preventDefault();
          setQuickLookItem(prev => (prev ? null : selectedItem));
        }
        return;
      }

      if (e.key === 'Enter') {
        if (selectedItem) {
          e.preventDefault();
          if (selectedItem.isDirectory) {
            setIsFavoritesView(false);
            setIsHomeView(false);
            setCurrentPath(selectedItem.path);
          } else {
            setTimelineFeedback(`Inserido: ${selectedItem.name}`);
            await premiereService.insertAtPlayhead(selectedItem.path);
            setTimeout(() => setTimelineFeedback(null), 2500);
          }
        }
        return;
      }

      if (e.key === 'Backspace' || (e.altKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        handleNavigateUp();
        return;
      }

      if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
        if (filteredItems.length === 0) return;
        e.preventDefault();

        const currentIndex = selectedItem ? filteredItems.findIndex(i => i.path === selectedItem.path) : -1;
        let nextIndex = 0;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
        }

        const nextItem = filteredItems[nextIndex];
        if (nextItem) {
          setSelectedItem(nextItem);
          setTimeout(() => {
            const el = document.querySelector(`[data-path="${CSS.escape(nextItem.path)}"]`);
            if (el) {
              el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }, 20);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, filteredItems, handleNavigateUp]);

  return (
    <div 
      className={`flex h-full w-full overflow-hidden relative theme-${themeMode} ${hwAccelEnabled ? 'transform-gpu' : ''}`}
      onClick={() => setContextMenu(null)}
    >
      {/* Toast Feedback */}
      {timelineFeedback && (
        <div className="absolute top-3 right-4 z-50 px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2 border border-emerald-400/30">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>{timelineFeedback}</span>
        </div>
      )}

      <Sidebar
        currentPath={currentPath}
        isFavoritesView={isFavoritesView && !isHomeView}
        favoritesCount={favoritesCount}
        customLibraries={customLibraries}
        isCollapsed={isSidebarCollapsed}
        width={sidebarWidth}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onWidthChange={handleSidebarWidthChange}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onSelectPath={(p) => {
          setIsHomeView(false);
          setIsFavoritesView(false);
          setCurrentPath(p);
        }}
        onSelectFavoritesView={loadFavorites}
        onOpenAddLibraryModal={() => setIsAddLibModalOpen(true)}
        onDeleteLibrary={handleDeleteLibrary}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Toolbar
          currentPath={isHomeView ? '🏠 Início' : isFavoritesView ? '⭐ Meus Favoritos' : currentPath}
          volume={previewVolume}
          onVolumeChange={handleVolumeChange}
          onNavigatePath={(p) => {
            setIsHomeView(false);
            setIsFavoritesView(false);
            setCurrentPath(p);
          }}
          onNavigateHome={handleNavigateHome}
          onNavigateUp={handleNavigateUp}
          onRefresh={() => (isHomeView ? updateFavoritesCount() : isFavoritesView ? loadFavorites() : loadDirectory(currentPath, true))}
          canNavigateUp={!isHomeView && !isFavoritesView && currentPath.split(/\\|\//).filter(Boolean).length > 1}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          mediaFilter={mediaFilter}
          onMediaFilterChange={setMediaFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          sortOrder={sortOrder}
          onSortChange={(opt) => {
            if (sortOption === opt) {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortOption(opt);
              setSortOrder('asc');
            }
          }}
          gridSize={gridSize}
          onGridSizeChange={handleGridSizeChange}
        />

        {isHomeView ? (
          <HomeScreen
            favoritesCount={favoritesCount}
            customLibraries={customLibraries}
            language={language}
            onOpenFavorites={loadFavorites}
            onOpenPath={(p) => {
              setIsHomeView(false);
              setIsFavoritesView(false);
              setCurrentPath(p);
            }}
            onOpenAddLibrary={() => setIsAddLibModalOpen(true)}
          />
        ) : isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
            <div className="w-5 h-5 border-2 border-apple-accent border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs">Carregando...</span>
          </div>
        ) : viewMode === 'grid' ? (
          <FileGrid
            items={filteredItems}
            selectedItem={selectedItem}
            onSelect={setSelectedItem}
            onOpen={(item) => {
              setIsFavoritesView(false);
              setIsHomeView(false);
              setCurrentPath(item.path);
            }}
            onQuickLook={setQuickLookItem}
            onToggleStar={handleToggleStar}
            onContextMenu={handleOpenContextMenu}
            gridSize={gridSize}
            volume={previewVolume}
            hoverScrubEnabled={hoverScrubEnabled}
          />
        ) : (
          <FileList
            items={filteredItems}
            selectedItem={selectedItem}
            onSelect={setSelectedItem}
            onOpen={(item) => {
              setIsFavoritesView(false);
              setIsHomeView(false);
              setCurrentPath(item.path);
            }}
            onQuickLook={setQuickLookItem}
            onToggleStar={handleToggleStar}
            onContextMenu={handleOpenContextMenu}
            volume={previewVolume}
          />
        )}
      </div>

      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Context Menu Modal */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={() => setContextMenu(null)}
          onToggleStar={handleToggleStar}
          onQuickLook={setQuickLookItem}
          onSetLabelColor={handleSetLabelColor}
        />
      )}

      {quickLookItem && (
        <QuickLookModal
          item={quickLookItem}
          volume={previewVolume}
          onVolumeChange={handleVolumeChange}
          onClose={() => setQuickLookItem(null)}
        />
      )}

      {isAddLibModalOpen && (
        <AddLibraryModal
          onClose={() => setIsAddLibModalOpen(false)}
          onAddLibrary={handleAddLibrary}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          themeMode={themeMode}
          volume={previewVolume}
          language={language}
          hoverScrubEnabled={hoverScrubEnabled}
          hwAccelEnabled={hwAccelEnabled}
          onVolumeChange={handleVolumeChange}
          onToggleTheme={handleToggleTheme}
          onLanguageChange={handleLanguageChange}
          onToggleHoverScrub={handleToggleHoverScrub}
          onToggleHwAccel={handleToggleHwAccel}
          onClose={() => setIsSettingsModalOpen(false)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      )}
    </div>
  );
};
