export interface ColorOption {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const LABEL_COLORS: ColorOption[] = [
  { id: 'blue', name: 'Azul', bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/40', dot: '#38bdf8' },
  { id: 'purple', name: 'Roxo', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', dot: '#c084fc' },
  { id: 'green', name: 'Verde', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: '#34d399' },
  { id: 'yellow', name: 'Amarelo', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', dot: '#fbbf24' },
  { id: 'orange', name: 'Laranja', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', dot: '#fb923c' },
  { id: 'red', name: 'Vermelho', bg: 'bg-rose-500/20', text: 'text-rose-500', border: 'border-rose-500/40', dot: '#f43f5e' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/40', dot: '#f472b6' },
  { id: 'cyan', name: 'Ciano', bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', dot: '#22d3ee' },
];
