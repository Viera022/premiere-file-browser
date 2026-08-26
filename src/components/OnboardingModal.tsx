import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Keyboard, 
  FolderHeart, 
  Star, 
  Tag, 
  User, 
  Zap,
  Globe
} from 'lucide-react';
import { PremiereLogo } from './PremiereLogo';
import { FlagIcon } from './FlagIcon';
import { Language, SUPPORTED_LANGUAGES, getTranslation } from '../i18n/translations';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (userName: string, language: Language) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState<Language>(() => {
    return (localStorage.getItem('filebrowser_language') as Language) || 'pt';
  });

  const [userNameInput, setUserNameInput] = useState(() => {
    return localStorage.getItem('filebrowser_user_name') || '';
  });

  if (!isOpen) return null;

  const t = getTranslation(selectedLang);

  const handleLangChange = (code: Language) => {
    setSelectedLang(code);
    localStorage.setItem('filebrowser_language', code);
  };

  const handleFinish = () => {
    const finalName = userNameInput.trim();
    if (finalName) {
      localStorage.setItem('filebrowser_user_name', finalName);
    }
    localStorage.setItem('filebrowser_language', selectedLang);
    localStorage.setItem('filebrowser_onboarding_completed', 'true');
    onComplete(finalName, selectedLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[440px] animate-scale-in relative overflow-hidden">
        {/* Top Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                step === s 
                  ? 'w-7 bg-apple-accent' 
                  : step > s 
                  ? 'w-3 bg-emerald-500' 
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Idioma + Boas-vindas & Nome */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto animate-fade-in">
            <div className="w-13 h-13 rounded-2xl bg-black/60 border border-white/10 shadow-xl flex items-center justify-center mb-2.5 p-2.5">
              <PremiereLogo className="w-8 h-8" />
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              {t.onboardingTitle}
            </h2>
            <p className="text-[11px] text-zinc-400 max-w-xs mb-4">
              {t.onboardingSub}
            </p>

            {/* Language Selector Pills with Crisp Vector SVG Flags */}
            <div className="w-full max-w-xs mb-4 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-apple-textMuted mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-sky-400" />
                <span>{t.selectLanguage}</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {SUPPORTED_LANGUAGES.map((l) => {
                  const isSelected = selectedLang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold border transition-all flex flex-col items-center gap-1 ${
                        isSelected 
                          ? 'bg-apple-accent text-white border-apple-accent shadow-md scale-105' 
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

            {/* User Name Input */}
            <div className="w-full max-w-xs text-left">
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-apple-accent" />
                <span>{t.whatName}</span>
              </label>
              <input
                type="text"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setStep(2);
                }}
                placeholder={t.namePlaceholder}
                autoFocus
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/5 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-apple-accent transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 2: Atalhos Turbo de Teclado */}
        {step === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-apple-accent/10 border border-apple-accent/20 flex items-center justify-center mb-3 text-apple-accent">
              <Keyboard className="w-6 h-6" />
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              {t.turboKeyboardTitle}
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs mb-4">
              {t.turboKeyboardSub}
            </p>

            <div className="w-full space-y-2 text-left">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-300">{t.shortcuts.navigate}</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">
                  ↑ ↓ ← →
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-300">{t.shortcuts.insertTimeline}</span>
                <kbd className="px-2 py-0.5 rounded bg-apple-accent text-white font-mono font-bold text-[10px]">
                  Enter
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-300">{t.shortcuts.quicklook}</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">
                  {selectedLang === 'en' ? 'Space' : 'Espaço'}
                </kbd>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-300">{t.shortcuts.goBack}</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">
                  Alt + ←
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Organização & Bibliotecas */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 text-amber-400">
              <FolderHeart className="w-6 h-6" />
            </div>

            <h2 className="text-base font-bold text-white mb-1">
              {t.orgTitle}
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs mb-4">
              {t.orgSub}
            </p>

            <div className="w-full space-y-2 text-left text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5">
                <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 fill-amber-400/20" />
                <div>
                  <div className="font-semibold text-zinc-200">{t.features.favorites}</div>
                  <div className="text-[10px] text-zinc-400">{t.features.favoritesSub}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5">
                <Tag className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">{t.features.labels}</div>
                  <div className="text-[10px] text-zinc-400">{t.features.labelsSub}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5">
                <Zap className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">{t.features.hoverPreview}</div>
                  <div className="text-[10px] text-zinc-400">{t.features.hoverPreviewSub}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t.btnBack}
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all"
            >
              <span>{t.btnNext}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.btnFinish}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
