import { Logo } from "./Logo";
import { HuemapView } from "./HuemapView";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-4">
        <Logo />
      </header>
      <main className="mx-auto max-w-5xl px-8 py-8">
        <HuemapView />
      </main>
    </div>
  );
}
