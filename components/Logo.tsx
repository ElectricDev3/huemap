export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="brand-wheel h-8 w-8 shrink-0 rounded-full shadow-sm ring-2 ring-white" />
      <div className="leading-tight">
        <p className="brand-gradient-text text-sm font-bold tracking-tight">Huemap</p>
        <p className="text-xs text-slate-400">Paletas accesibles</p>
      </div>
    </div>
  );
}
