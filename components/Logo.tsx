import { Palette } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
        <Palette size={16} strokeWidth={2.25} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-slate-900">Huemap</p>
        <p className="text-xs text-slate-400">Paletas accesibles</p>
      </div>
    </div>
  );
}
