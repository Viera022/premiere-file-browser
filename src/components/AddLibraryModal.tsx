import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FolderPlus, 
  Folder, 
  Music, 
  Film, 
  Type, 
  Layers, 
  Download, 
  Star, 
  Flame, 
  Image as ImageIcon,
  Check,
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
  HardDrive,
  Cloud,
  Briefcase,
  Trophy,
  Code,
  Clock,
  Shield,
  Heart,
  FolderHeart,
  FileCode,
  Sliders,
  Tv
} from 'lucide-react';
import { CustomLibrary } from '../types';
import { fileSystemService } from '../services/fileSystemService';

interface AddLibraryModalProps {
  onClose: () => void;
  onAddLibrary: (lib: Omit<CustomLibrary, 'id'>) => void;
}

export const ICON_OPTIONS = [
  // Media & Video
  { id: 'film', label: 'Filme', icon: Film, color: 'text-sky-400' },
  { id: 'clapperboard', label: 'Claquete', icon: Clapperboard, color: 'text-blue-400' },
  { id: 'video', label: 'Footage', icon: Video, color: 'text-cyan-400' },
  { id: 'tv', label: 'Display/TV', icon: Tv, color: 'text-indigo-400' },
  { id: 'sparkles', label: 'MOGRTs', icon: Sparkles, color: 'text-amber-400' },
  { id: 'wand2', label: 'VFX / Magia', icon: Wand2, color: 'text-purple-400' },
  { id: 'zap', label: 'Transições', icon: Zap, color: 'text-yellow-400' },
  { id: 'flame', label: 'Destaque/Viral', icon: Flame, color: 'text-rose-500' },

  // Audio & Sound
  { id: 'music', label: 'Músicas', icon: Music, color: 'text-pink-400' },
  { id: 'volume2', label: 'SFX Sons', icon: Volume2, color: 'text-rose-400' },
  { id: 'mic', label: 'Voz / Mic', icon: Mic, color: 'text-emerald-400' },
  { id: 'headphones', label: 'Fone / Beats', icon: Headphones, color: 'text-violet-400' },
  { id: 'disc', label: 'Álbum / Vinil', icon: Disc, color: 'text-amber-300' },
  { id: 'radio', label: 'Rádio', icon: Radio, color: 'text-teal-400' },

  // Design & Typography
  { id: 'type', label: 'Fontes', icon: Type, color: 'text-emerald-400' },
  { id: 'palette', label: 'LUTs / Cores', icon: Palette, color: 'text-fuchsia-400' },
  { id: 'layers', label: 'Texturas', icon: Layers, color: 'text-purple-400' },
  { id: 'image', label: 'Fotos', icon: ImageIcon, color: 'text-blue-300' },
  { id: 'box', label: 'Packs / 3D', icon: Box, color: 'text-amber-500' },
  { id: 'crop', label: 'Recortes', icon: Crop, color: 'text-sky-300' },
  { id: 'smile', label: 'Memes / Emojis', icon: Smile, color: 'text-yellow-300' },

  // Organization & Folders
  { id: 'folder', label: 'Pasta', icon: Folder, color: 'text-blue-400' },
  { id: 'folder-heart', label: 'Favoritos', icon: FolderHeart, color: 'text-rose-400' },
  { id: 'star', label: 'Estrela', icon: Star, color: 'text-yellow-400' },
  { id: 'heart', label: 'Coração', icon: Heart, color: 'text-pink-500' },
  { id: 'download', label: 'Downloads', icon: Download, color: 'text-teal-400' },
  { id: 'tag', label: 'Tag', icon: Tag, color: 'text-indigo-400' },
  { id: 'bookmark', label: 'Marcador', icon: Bookmark, color: 'text-orange-400' },
  { id: 'briefcase', label: 'Clientes / Trab', icon: Briefcase, color: 'text-amber-400' },
  { id: 'trophy', label: 'Portfólio', icon: Trophy, color: 'text-yellow-500' },
  { id: 'archive', label: 'Arquivo', icon: Archive, color: 'text-zinc-400' },
  { id: 'hard-drive', label: 'Disco / SSD', icon: HardDrive, color: 'text-sky-400' },
  { id: 'cloud', label: 'Nuvem', icon: Cloud, color: 'text-emerald-400' },
  { id: 'code', label: 'Scripts / JSX', icon: Code, color: 'text-green-400' },
  { id: 'sliders', label: 'Presets', icon: Sliders, color: 'text-blue-400' },
  { id: 'shield', label: 'Master / Seguro', icon: Shield, color: 'text-emerald-500' }
];

export const AddLibraryModal: React.FC<AddLibraryModalProps> = ({ onClose, onAddLibrary }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'custom'>('suggestions');
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');

  const suggestions = fileSystemService.getSmartSuggestions();

  const handlePickFolder = async () => {
    const picked = await fileSystemService.openFolderPicker(path || 'E:\\Assets');
    if (picked) {
      setPath(picked);
      if (!name) {
        const folderName = picked.split(/\\|\//).filter(Boolean).pop() || 'Minha Pasta';
        setName(folderName);
      }
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;
    onAddLibrary({
      name: name.trim(),
      path: fileSystemService.normalizePath(path.trim()),
      icon: selectedIcon
    });
    onClose();
  };

  const handleAddSuggestion = (sug: typeof suggestions[0]) => {
    onAddLibrary({
      name: sug.name,
      path: sug.path,
      icon: sug.icon
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl glass-quicklook rounded-2xl flex flex-col overflow-hidden shadow-quicklook border border-white/15 animate-scale-in max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.04] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-white shadow-sm">
              <FolderPlus className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-white">Adicionar Biblioteca</h2>
          </div>

          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center text-white"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 border-b border-white/10 bg-black/20 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'suggestions'
                ? 'bg-accent text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Sugestões Rápidas</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'custom'
                ? 'bg-accent text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>📁 Criar Personalizada</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'suggestions' ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  Pastas de Assets & Edição
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.filter(s => s.category === 'assets').map((sug) => {
                    const IconComp = ICON_OPTIONS.find(i => i.id === sug.icon)?.icon || Folder;
                    return (
                      <button
                        key={sug.path}
                        onClick={() => handleAddSuggestion(sug)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl glass-card hover:border-accent text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-accent/20 flex items-center justify-center text-accent shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{sug.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{sug.path}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Pastas do Usuário (Windows)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.filter(s => s.category === 'system').map((sug) => {
                    const IconComp = ICON_OPTIONS.find(i => i.id === sug.icon)?.icon || Folder;
                    return (
                      <button
                        key={sug.path}
                        onClick={() => handleAddSuggestion(sug)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl glass-card hover:border-emerald-500 text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{sug.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{sug.path}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-3.5">
              {/* Folder Selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Caminho da Pasta:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="Ex: E:\\Meus Assets\\Sons"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 outline-none focus:border-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={handlePickFolder}
                    className="px-3 py-1.5 rounded-lg text-xs btn-glass font-medium shrink-0"
                  >
                    Procurar...
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nome da Biblioteca:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Minha Coleção de SFX"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Icon Palette Grid (35+ Icons) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Escolha um Ícone ({ICON_OPTIONS.length} opções disponíveis):
                </label>
                <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1 bg-black/30 rounded-xl border border-white/5">
                  {ICON_OPTIONS.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = selectedIcon === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedIcon(opt.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-accent/30 border-accent text-white shadow-md scale-105'
                            : 'bg-white/[0.02] border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={opt.label}
                      >
                        <IconComp className={`w-4 h-4 mb-0.5 ${opt.color}`} />
                        <span className="text-[8px] truncate max-w-full font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!name.trim() || !path.trim()}
                  className="w-full py-2 rounded-xl text-xs font-bold btn-glass-accent flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Biblioteca</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
