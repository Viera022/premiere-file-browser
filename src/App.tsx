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

const KONAMI_KEYS = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

export const App: React.FC = () => {
  const konamiIndexRef = useRef(0);
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
  const [isHomeView, setIsHomeView] = useState<boolean>(true);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [quickLookItem, setQuickLookItem] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timelineFeedback, setTimelineFeedback] = useState<string | null>(null);
  const [isNyanActive, setIsNyanActive] = useState(false);
  const [isPsychedelicMode, setIsPsychedelicMode] = useState(false);
  const [lastKeys, setLastKeys] = useState<string[]>([]);
  const [nyanSeconds, setNyanSeconds] = useState(0);

  // Request counter to cancel stale background loads
  const loadRequestIdRef = useRef(0);

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Recursive Search State
  const [isRecursiveSearch, setIsRecursiveSearch] = useState<boolean>(() => {
    return localStorage.getItem('filebrowser_recursive_search') === 'true';
  });
  const [isSearchingRecursive, setIsSearchingRecursive] = useState(false);
  const [recursiveResults, setRecursiveResults] = useState<FileItem[]>([]);
  const recursiveAbortControllerRef = useRef<AbortController | null>(null);

  const handleToggleRecursiveSearch = () => {
    const nextVal = !isRecursiveSearch;
    setIsRecursiveSearch(nextVal);
    localStorage.setItem('filebrowser_recursive_search', nextVal ? 'true' : 'false');
  };

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

  // Asynchronous Recursive Search Pipeline
  useEffect(() => {
    if (isHomeView || isFavoritesView || !isRecursiveSearch || !searchQuery.trim()) {
      if (recursiveAbortControllerRef.current) {
        recursiveAbortControllerRef.current.abort();
        recursiveAbortControllerRef.current = null;
      }
      setIsSearchingRecursive(false);
      setRecursiveResults([]);
      return;
    }

    if (recursiveAbortControllerRef.current) {
      recursiveAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    recursiveAbortControllerRef.current = controller;

    setRecursiveResults([]);
    setIsSearchingRecursive(true);

    const debounceTimer = setTimeout(() => {
      fileSystemService.searchRecursive(
        currentPath,
        searchQuery,
        mediaFilter,
        { maxDepth: 6, maxResults: 600 },
        (batch) => {
          if (!controller.signal.aborted) {
            setRecursiveResults(prev => [...prev, ...batch]);
          }
        },
        controller.signal
      )
        .then((finalResults) => {
          if (!controller.signal.aborted) {
            setRecursiveResults(finalResults);
            setIsSearchingRecursive(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setIsSearchingRecursive(false);
          }
        });
    }, 200);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [currentPath, searchQuery, mediaFilter, isRecursiveSearch, isHomeView, isFavoritesView]);

  const filteredItems = useMemo(() => {
    if (isHomeView) return [];

    const isRecursiveActive = isRecursiveSearch && searchQuery.trim().length > 0;
    const baseList = isRecursiveActive ? recursiveResults : files;

    return baseList
      .filter((item) => {
        if (isRecursiveActive) {
          // Already filtered by query and mediaType during recursive scan
          return true;
        }
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
  }, [files, recursiveResults, isRecursiveSearch, mediaFilter, searchQuery, sortOption, sortOrder, isHomeView]);

  const handleNavigateUp = useCallback(() => {
    const parts = currentPath.split(/\\|\//).filter(Boolean);
    if (parts.length > 1) {
      parts.pop();
      const parent = parts.join('\\');
      setIsHomeView(false);
      setCurrentPath(parent);
    }
  }, [currentPath]);

  const handleNavigateToParentFolder = useCallback((folderPath: string) => {
    setIsHomeView(false);
    setIsFavoritesView(false);
    setCurrentPath(folderPath);
    setSearchQuery('');
  }, []);

    useEffect(() => {
    let interval: any;
    if (isNyanActive) {
      setNyanSeconds(0);
      interval = setInterval(() => {
        setNyanSeconds(s => s + 1);
      }, 1000);
    } else {
      setNyanSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNyanActive]);

    // Register key events interest with Adobe CEP to intercept key presses (ESC, Space, etc.)
  useEffect(() => {
    if (typeof (window as any).CSInterface !== 'undefined') {
      try {
        const cs = new (window as any).CSInterface();
        const interests = JSON.stringify([
          { keyCode: 27 }, // Escape
          { keyCode: 32 }, // Space
          { keyCode: 37 }, // ArrowLeft
          { keyCode: 38 }, // ArrowUp
          { keyCode: 39 }, // ArrowRight
          { keyCode: 40 }, // ArrowDown
          { keyCode: 8 },  // Backspace
          { keyCode: 13 }, // Enter
          { keyCode: 66 }, // B
          { keyCode: 65 }  // A
        ]);
        cs.registerKeyEventsInterest(interests);
      } catch (e) {
        console.warn('[App] Failed to register key events interest:', e);
      }
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Log keystroke for visual debugging
      setLastKeys(prev => {
        const keyDesc = `${e.key || 'Unknown'} (${e.keyCode || e.which || '?'})`;
        return [...prev, keyDesc].slice(-5);
      });

      // Bulletproof Konami Code Tracker
      const keyLower = e.key ? e.key.toLowerCase() : '';
      const expectedKey = KONAMI_KEYS[konamiIndexRef.current];
      
      const isMatch = 
        keyLower === expectedKey ||
        (e.keyCode === 38 && expectedKey === 'arrowup') ||
        (e.keyCode === 40 && expectedKey === 'arrowdown') ||
        (e.keyCode === 37 && expectedKey === 'arrowleft') ||
        (e.keyCode === 39 && expectedKey === 'arrowright') ||
        (e.keyCode === 66 && expectedKey === 'b') ||
        (e.keyCode === 65 && expectedKey === 'a');

      if (isMatch) {
        konamiIndexRef.current += 1;
        if (konamiIndexRef.current === KONAMI_KEYS.length) {
          konamiIndexRef.current = 0;
          setIsPsychedelicMode(p => !p);
        }
      } else {
        konamiIndexRef.current = 0;
        // Check if start of sequence
        const isFirstMatch = 
          keyLower === KONAMI_KEYS[0] || 
          (e.keyCode === 38 && KONAMI_KEYS[0] === 'arrowup');
        if (isFirstMatch) {
          konamiIndexRef.current = 1;
        }
      }

      if (isNyanActive && (e.key === 'Escape' || e.code === 'Escape' || e.key === 'Esc')) {
        e.preventDefault();
        e.stopPropagation();
        setIsNyanActive(false);
        return;
      }
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

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedItem, filteredItems, handleNavigateUp, isNyanActive, isPsychedelicMode]);

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden relative theme-${themeMode} ${hwAccelEnabled ? 'transform-gpu' : ''}`}
      onClick={() => setContextMenu(null)}
    >
      {/* Toast Feedback */}
      {timelineFeedback && (
        <div className="absolute top-3 right-4 z-50 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2 border border-emerald-400/30">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>{timelineFeedback}</span>
        </div>
      )}

      <Sidebar
        language={language}
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
          language={language}
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
          isRecursiveSearch={isRecursiveSearch}
          onToggleRecursiveSearch={handleToggleRecursiveSearch}
          isSearchingRecursive={isSearchingRecursive}
          recursiveMatchCount={filteredItems.length}
        />

        {isHomeView ? (
          <HomeScreen
            onTriggerNyan={() => setIsNyanActive(true)}
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
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
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
          onNavigateToParentFolder={handleNavigateToParentFolder}
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

                        {isNyanActive && (
        <div className="fixed inset-0 z-50 bg-[#003366] flex flex-col items-center justify-center select-none overflow-hidden font-mono text-white">
          <audio src="./nyan.mp3" autoPlay loop />
          
          {/* Starry Background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-[10%] left-[20%] text-white text-xs animate-pulse">✦</div>
            <div className="absolute top-[30%] left-[80%] text-white text-xs animate-pulse delay-100">✦</div>
            <div className="absolute top-[70%] left-[15%] text-white text-xs animate-pulse delay-200">✦</div>
            <div className="absolute top-[60%] left-[50%] text-white text-xs animate-pulse delay-300">✦</div>
            <div className="absolute top-[80%] left-[85%] text-white text-xs animate-pulse delay-75">✦</div>
            <div className="absolute top-[25%] left-[40%] text-white text-xs animate-pulse delay-150">✦</div>
          </div>

          <div className="text-center z-10 flex flex-col items-center gap-6 w-full max-w-2xl px-6">
            <h1 className="text-yellow-300 font-black text-lg animate-pulse uppercase tracking-widest">
              🌈 NYAN CAT MODE! 🌈
            </h1>
            
            {/* Retro Game Scene Container */}
            <div className="relative w-full h-64 bg-[#002244] border-4 border-black rounded-2xl overflow-hidden shadow-2xl">
              {/* Starry background inside scene */}
              <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute top-[15%] left-[10%] text-white text-[10px] animate-pulse">✦</div>
                <div className="absolute top-[25%] left-[75%] text-white text-[10px] animate-pulse delay-75">✦</div>
                <div className="absolute top-[75%] left-[25%] text-white text-[10px] animate-pulse delay-150">✦</div>
                <div className="absolute top-[65%] left-[85%] text-white text-[10px] animate-pulse delay-100">✦</div>
              </div>

              {/* Oscillating Rainbow Trail (Perfect alignment, centered vertically) */}
              <div className="absolute left-0 right-[50%] mr-[50px] top-1/2 -translate-y-1/2 h-24 flex overflow-hidden pointer-events-none select-none items-center justify-end">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col shrink-0 w-4 h-12 ${
                      i % 2 === 0 ? 'animate-rainbow-even' : 'animate-rainbow-odd'
                    }`}
                  >
                    <div className="w-full h-[8px] bg-[#ff0000]" />
                    <div className="w-full h-[8px] bg-[#ff9900]" />
                    <div className="w-full h-[8px] bg-[#ffff00]" />
                    <div className="w-full h-[8px] bg-[#33ff00]" />
                    <div className="w-full h-[8px] bg-[#0099ff]" />
                    <div className="w-full h-[8px] bg-[#6633ff]" />
                  </div>
                ))}
              </div>

              {/* Centered Outer container for horizontal/vertical stability */}
              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-44 h-44 flex items-center justify-center z-10 pointer-events-none">
                {/* Floating Inner container with keyframe translate */}
                <div className="w-full h-full flex items-center justify-center animate-nyan-float">
                  <img src="./nyan.gif" alt="Nyan Cat" className="w-full h-auto object-contain" />
                </div>
              </div>
            </div>

            <div className="mt-2 text-white text-xs text-center space-y-1 bg-black/30 p-3 rounded-xl border border-white/5 backdrop-blur-sm w-full max-w-sm">
              <p className="font-bold text-xs text-zinc-100">
                {language === 'pt' 
                  ? `Você está nyanando por ${nyanSeconds} segundos!` 
                  : `You have nyanned for ${nyanSeconds} seconds!`}
              </p>
              <p className="text-zinc-400 text-[9px] mt-1">
                {language === 'pt' 
                  ? 'Pressione ESC para fechar' 
                  : 'Press ESC to exit'}
              </p>
            </div>
          </div>
        </div>
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
