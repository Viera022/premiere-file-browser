import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, Globe, GraduationCap, User, Film, Cpu, AlertTriangle } from 'lucide-react';
import { ThemeMode } from '../types';
import { Language, SUPPORTED_LANGUAGES, getTranslation } from '../i18n/translations';
import { FlagIcon } from './FlagIcon';

interface SettingsModalProps {
  themeMode: ThemeMode;
  volume: number;
  language: Language;
  hoverScrubEnabled: boolean;
  hwAccelEnabled: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleTheme: () => void;
  onLanguageChange: (lang: Language) => void;
  onToggleHoverScrub: () => void;
  onToggleHwAccel: () => void;
  onClose: () => void;
  onOpenOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  themeMode,
  volume,
  language = 'pt',
  hoverScrubEnabled,
  hwAccelEnabled,
  onVolumeChange,
  onToggleTheme,
  onLanguageChange,
  onToggleHoverScrub,
  onToggleHwAccel,
  onClose,
  onOpenOnboarding
}) => {
  const t = getTranslation(language);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('filebrowser_user_name') || '';
  });
  const [shouldSimulateCrash, setShouldSimulateCrash] = useState(false);

  if (shouldSimulateCrash) {
    throw new Error('Simulação de Erro de Teste: O mecanismo de proteção e ErrorBoundary capturou a falha com sucesso!');
  }

  const handleSaveName = (val: string) => {
    setUserName(val);
    localStorage.setItem('filebrowser_user_name', val.trim());
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-zinc-900 border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-3.5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <h2 className="text-sm font-bold text-white tracking-wide">{t.settingsTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Name Setting */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-accent" />
            <span>{t.userNameLabel}</span>
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => handleSaveName(e.target.value)}
            placeholder={t.userNamePlaceholder}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Language Selector with Vector SVG Flags */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.langLabel}</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => onLanguageChange(l.code)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold border transition-all flex flex-col items-center gap-1 ${
                    isSelected 
                      ? 'bg-accent text-white border-accent shadow-md scale-105' 
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                  title={l.nativeName}
                >
                  <FlagIcon code={l.code} className="w-5 h-3.5" />
                  <span className="truncate max-w-[50px]">{l.code.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hardware Acceleration (GPU) Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-white/5 pt-2">
          <div className="flex flex-col pr-2">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.hwAccelLabel}</span>
            </span>
            <span className="text-[10px] text-zinc-400 leading-tight mt-0.5">
              {t.hwAccelSub}
            </span>
          </div>
          <button
            onClick={onToggleHwAccel}
            className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
              hwAccelEnabled ? 'bg-emerald-500' : 'bg-white/15'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                hwAccelEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Hover Scrubbing Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col pr-2">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.hoverScrubLabel}</span>
            </span>
            <span className="text-[10px] text-zinc-400 leading-tight mt-0.5">
              {t.hoverScrubSub}
            </span>
          </div>
          <button
            onClick={onToggleHoverScrub}
            className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
              hoverScrubEnabled ? 'bg-accent' : 'bg-white/15'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                hoverScrubEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Theme Setting */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">{t.appearanceLabel}</span>
            <span className="text-[10px] text-zinc-400">{t.appearanceSub}</span>
          </div>
          <button
            onClick={onToggleTheme}
            className="px-3 py-1.5 rounded-xl btn-glass text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5"
          >
            {themeMode === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.themeDark}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.themeLight}</span>
              </>
            )}
          </button>
        </div>

        {/* Volume Setting */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.defaultVolLabel}</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg cursor-pointer accent-accent"
          />
        </div>

        {/* Replay Onboarding Button */}
        {onOpenOnboarding && (
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-accent" />
              <span>{t.replayTour}</span>
            </button>
          </div>
        )}

        {/* 🚨 Test Crash Simulation Button */}
        <div className="pt-1.5 border-t border-white/10">
          <button
            onClick={() => setShouldSimulateCrash(true)}
            className="w-full py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-semibold text-rose-300 hover:text-rose-200 flex items-center justify-center gap-1.5 transition-colors"
            title={t.simulateCrashTooltip}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>🚨 {t.simulateCrash}</span>
          </button>
        </div>

        <div className="pt-1 border-t border-white/10 text-center">
          <span className="text-[10px] text-zinc-500 font-mono">Premiere File Browser v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
