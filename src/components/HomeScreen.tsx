import React from 'react';
import { 
  Star, 
  HardDrive, 
  Download, 
  Plus, 
  Folder
} from 'lucide-react';
import { CustomLibrary } from '../types';
import { Language, getTranslation } from '../i18n/translations';

interface HomeScreenProps {
  favoritesCount: number;
  customLibraries: CustomLibrary[];
  userName?: string;
  language?: Language;
  onOpenFavorites: () => void;
  onOpenMainDrive?: () => void;
  onOpenDownloads?: () => void;
  onOpenAddLibrary: () => void;
  onOpenPath: (path: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  favoritesCount,
  customLibraries,
  userName = 'Viera',
  language = 'pt',
  onOpenFavorites,
  onOpenMainDrive,
  onOpenDownloads,
  onOpenAddLibrary,
  onOpenPath
}) => {
  const t = getTranslation(language);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greetingsList = t.morningGreetings;
    let sub = t.morningSub;

    if (hour >= 0 && hour < 5) {
      greetingsList = t.lateGreetings;
      sub = t.lateSub;
    } else if (hour >= 5 && hour < 8) {
      greetingsList = t.earlyGreetings;
      sub = t.earlySub;
    } else if (hour >= 8 && hour < 12) {
      greetingsList = t.morningGreetings;
      sub = t.morningSub;
    } else if (hour >= 12 && hour < 18) {
      greetingsList = t.afternoonGreetings;
      sub = t.afternoonSub;
    } else {
      greetingsList = t.eveningGreetings;
      sub = t.eveningSub;
    }

    const list = Array.isArray(greetingsList) ? greetingsList : ['Olá'];
    const chosen = list[0] || 'Olá';
    const finalGreeting = chosen.includes('?') ? chosen : `${chosen}, ${userName || 'Viera'}?`;

    return { greeting: finalGreeting, subtext: sub || '' };
  };

  const { greeting, subtext } = getGreeting();

  const handleOpenMainDrive = onOpenMainDrive || (() => onOpenPath('C:\\'));
  const handleOpenDownloads = onOpenDownloads || (() => {
    const userProfile = (typeof process !== 'undefined' && process.env && process.env.USERPROFILE) ? process.env.USERPROFILE : 'C:\\Users\\Default';
    onOpenPath(userProfile + '\\Downloads');
  });

  const quickHubItems = [
    {
      title: t.hubFavorites || 'Meus Favoritos',
      desc: favoritesCount > 0 ? `${favoritesCount} ${t.hubFavoritesSaved || 'itens salvos'}` : (t.hubFavoritesEmpty || 'Nenhum item salvo'),
      icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />,
      action: onOpenFavorites,
      badge: favoritesCount > 0 ? `${favoritesCount}` : undefined,
      color: 'hover:border-amber-500/40 hover:bg-amber-500/5'
    },
    {
      title: t.hubAssets || 'Disco Principal',
      desc: "C:\\",
      icon: <HardDrive className="w-4 h-4 text-sky-400" />,
      action: handleOpenMainDrive,
      badge: "Drive",
      color: 'hover:border-sky-500/40 hover:bg-sky-500/5'
    },
    {
      title: t.hubDownloads || 'Downloads',
      desc: "Downloads",
      icon: <Download className="w-4 h-4 text-teal-400" />,
      action: handleOpenDownloads,
      badge: "Downloads",
      color: 'hover:border-teal-500/40 hover:bg-teal-500/5'
    },
    {
      title: t.hubAddLib || 'Adicionar Biblioteca',
      desc: t.hubAddLibSub || 'Mapear pastas do seu PC',
      icon: <Plus className="w-4 h-4 text-accent" />,
      action: onOpenAddLibrary,
      badge: "New",
      color: 'hover:border-accent/40 hover:bg-accent/5'
    }
  ];

  const shortcuts = [
    { key: '↑ ↓ ← →', desc: t.shortcuts?.navigate || 'Navegar' },
    { key: 'Enter', desc: t.shortcuts?.insertTimeline || 'Inserir na Timeline' },
    { key: 'Space', desc: t.shortcuts?.quicklook || 'QuickLook' },
    { key: 'Alt + ←', desc: t.shortcuts?.goBack || 'Voltar' }
  ];

  return (
    <div className="flex-1 h-full w-full flex flex-col bg-[#141416] select-none overflow-hidden">
      {/* Scrollable Center Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center custom-scrollbar">
        <div className="w-full max-w-lg flex flex-col items-center text-center my-auto py-2">
          {/* Premiere Pro Badge */}
          <div className="relative mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#00005b] border border-[#9999ff]/30 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <span className="text-[#9999ff] font-black text-lg tracking-tighter">Pr</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center shadow-md">
              <span className="text-[9px]">🌙</span>
            </div>
          </div>

          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white mb-0.5">
            {greeting}
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mb-4">
            {subtext}
          </p>

          {/* 2x2 Quick Hub Grid */}
          <div className="w-full grid grid-cols-2 gap-2.5 mb-3 text-left">
            {quickHubItems.map((item, i) => (
              <div
                key={i}
                onClick={item.action}
                className={`p-3 rounded-xl bg-[#1c1c1f] hover:bg-[#252529] border border-white/10 cursor-pointer transition-all duration-150 flex items-center justify-between gap-2.5 shadow-md group ${item.color} hover:scale-[1.01] active:scale-[0.99]`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:scale-105 transition-transform shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono font-semibold shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Configured Custom Libraries */}
          {customLibraries.length > 0 && (
            <div className="w-full text-left mt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 px-1">
                {t.configuredLibs || 'Minhas Bibliotecas'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {customLibraries.map((lib) => (
                  <button
                    key={lib.id}
                    onClick={() => onOpenPath(lib.path)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1c1c1f] hover:bg-[#252529] border border-white/10 hover:border-accent/50 text-xs font-medium text-zinc-200 hover:text-white transition-all shrink-0 cursor-pointer shadow-sm group"
                  >
                    <Folder className="w-3.5 h-3.5 text-accent shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{lib.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Bottom Bar (Like JerrySFX bottom bar) */}
      <div className="shrink-0 w-full border-t border-white/10 py-2 px-4 bg-[#111113] flex items-center justify-center text-[10px] text-zinc-400">
        <div className="flex items-center gap-2 flex-wrap justify-center w-full max-w-2xl">
          {shortcuts.map((sc, i) => (
            <div key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 shadow-sm">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-200 font-mono font-bold text-[9px] border border-white/10 shadow-sm shrink-0">
                {sc.key}
              </kbd>
              <span className="text-zinc-400">{sc.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
