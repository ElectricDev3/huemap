import { Logo } from "./Logo";
import { HuemapView } from "./HuemapView";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.09),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(234,88,12,0.08),transparent_40%)]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur">
        <Logo />
      </header>
      <main className="mx-auto max-w-5xl px-8 py-8">
        <HuemapView />
      </main>
    </div>
  );
}
