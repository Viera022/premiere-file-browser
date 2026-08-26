import React, { useMemo } from 'react';
import { 
  Star, 
  Folder, 
  HardDrive, 
  Download, 
  Plus, 
  Moon,
  Sun,
  Sunrise,
  Sunset
} from 'lucide-react';
import { CustomLibrary } from '../types';
import { fileSystemService } from '../services/fileSystemService';
import { PremiereLogo } from './PremiereLogo';
import { Language, getTranslation } from '../i18n/translations';

interface HomeScreenProps {
  favoritesCount: number;
  customLibraries: CustomLibrary[];
  language?: Language;
  onOpenFavorites: () => void;
  onOpenPath: (path: string) => void;
  onOpenAddLibrary: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  favoritesCount,
  customLibraries,
  language = 'pt',
  onOpenFavorites,
  onOpenPath,
  onOpenAddLibrary
}) => {
  const t = getTranslation(language);
  const userName = useMemo(() => {
    return fileSystemService.getUserName();
  }, []);

  const nameSuffix = userName ? `, ${userName}` : '';

  // Dynamic user paths
  const downloadsPath = useMemo(() => fileSystemService.getDownloadsPath(), []);
  const primaryDrive = useMemo(() => {
    const drives = fileSystemService.getDrives();
    return drives[0] || { path: 'C:\\', name: 'Disco Local (C:)' };
  }, []);

  const { greeting, subtext, icon } = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 22 || hour < 5) {
      const list = t.lateGreetings;
      const base = list[Math.floor(Math.random() * list.length)];
      return {
        greeting: `${base}${nameSuffix}?`,
        subtext: t.lateSub,
        icon: <Moon className="w-4 h-4 text-indigo-400" />
      };
    } else if (hour >= 5 && hour < 8) {
      const list = t.earlyGreetings;
      const base = list[Math.floor(Math.random() * list.length)];
      return {
        greeting: `${base}${nameSuffix}?`,
        subtext: t.earlySub,
        icon: <Sunrise className="w-4 h-4 text-amber-400" />
      };
    } else if (hour >= 8 && hour < 12) {
      const list = t.morningGreetings;
      const base = list[Math.floor(Math.random() * list.length)];
      return {
        greeting: `${base}${nameSuffix}.`,
        subtext: t.morningSub,
        icon: <Sun className="w-4 h-4 text-amber-300" />
      };
    } else if (hour >= 12 && hour < 18) {
      const list = t.afternoonGreetings;
      const base = list[Math.floor(Math.random() * list.length)];
      return {
        greeting: `${base}${nameSuffix}.`,
        subtext: t.afternoonSub,
        icon: <Sun className="w-4 h-4 text-amber-400" />
      };
    } else {
      const list = t.eveningGreetings;
      const base = list[Math.floor(Math.random() * list.length)];
      return {
        greeting: `${base}${nameSuffix}.`,
        subtext: t.eveningSub,
        icon: <Sunset className="w-4 h-4 text-rose-400" />
      };
    }
  }, [nameSuffix, t]);

  const quickHubItems = [
    {
      title: t.hubFavorites,
      desc: favoritesCount > 0 ? `${favoritesCount} ${t.hubFavoritesSaved}` : t.hubFavoritesEmpty,
      icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />,
      action: onOpenFavorites,
      badge: favoritesCount > 0 ? `${favoritesCount}` : undefined,
      color: 'hover:border-amber-500/40 hover:bg-amber-500/5'
    },
    {
      title: primaryDrive.name,
      desc: primaryDrive.path,
      icon: <HardDrive className="w-5 h-5 text-sky-400" />,
      action: () => onOpenPath(primaryDrive.path),
      badge: 'Drive',
      color: 'hover:border-sky-500/40 hover:bg-sky-500/5'
    },
    {
      title: t.hubDownloads,
      desc: downloadsPath,
      icon: <Download className="w-5 h-5 text-teal-400" />,
      action: () => onOpenPath(downloadsPath),
      badge: 'Downloads',
      color: 'hover:border-teal-500/40 hover:bg-teal-500/5'
    },
    {
      title: t.hubAddLib,
      desc: t.hubAddLibSub,
      icon: <Plus className="w-5 h-5 text-apple-accent" />,
      action: onOpenAddLibrary,
      badge: 'New',
      color: 'hover:border-apple-accent/40 hover:bg-apple-accent/5'
    }
  ];

  const shortcuts = [
    { key: '↑ ↓ ← →', desc: t.shortcuts.navigate },
    { key: 'Enter', desc: t.shortcuts.insertTimeline },
    { key: language === 'en' ? 'Space' : 'Espaço', desc: t.shortcuts.quicklook },
    { key: 'Alt + ←', desc: t.shortcuts.goBack },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-between text-center select-none animate-fade-in">
      <div className="w-full max-w-xl flex flex-col items-center my-auto">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center justify-center mb-4 relative group">
          <PremiereLogo className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-950 border border-white/10 shadow-md">
            {icon}
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5 flex items-center gap-2">
          <span>{greeting}</span>
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
          {subtext}
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left mb-6">
          {quickHubItems.map((item, i) => (
            <div
              key={i}
              onClick={item.action}
              className={`p-3 rounded-2xl glass-card border border-white/10 cursor-pointer transition-all duration-100 flex items-center justify-between group ${item.color}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white/5 group-hover:scale-105 transition-transform shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate font-mono">
                    {item.desc}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-semibold shrink-0">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {customLibraries.length > 0 && (
          <div className="w-full mb-6 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-apple-textMuted mb-2 px-1">
              {t.configuredLibs}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {customLibraries.map((lib) => (
                <button
                  key={lib.id}
                  onClick={() => onOpenPath(lib.path)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-apple-accent/50 text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-2"
                >
                  <Folder className="w-3.5 h-3.5 text-apple-accent" />
                  <span>{lib.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-xl pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-4 flex-wrap justify-center w-full">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono font-bold text-[9px] border border-white/10 shadow-sm">
                {sc.key}
              </kbd>
              <span>{sc.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
