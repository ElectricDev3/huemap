"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { contrast } from "@/lib/color";

interface PaletteSwatchesProps {
  palette: string[];
  surface: string;
}

export function PaletteSwatches({ palette, surface }: PaletteSwatchesProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  async function handleCopy(hex: string) {
    await navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex((prev) => (prev === hex ? null : prev)), 1200);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {palette.map((hex, i) => (
        <button
          key={`${hex}-${i}`}
          onClick={() => handleCopy(hex)}
          className="group overflow-hidden rounded-lg border border-slate-200 text-left transition-shadow hover:shadow-md"
        >
          <div className="flex h-20 items-center justify-center" style={{ background: hex }}>
            {copiedHex === hex ? (
              <Check size={18} className="text-white drop-shadow" />
            ) : (
              <Copy size={16} className="text-white/0 drop-shadow group-hover:text-white/80" />
            )}
          </div>
          <div className="bg-white px-2.5 py-2">
            <p className="font-mono text-xs font-medium text-slate-700">{hex}</p>
            <p className="text-[11px] text-slate-400">{contrast(hex, surface).toFixed(2)}:1 vs. superficie</p>
          </div>
        </button>
      ))}
    </div>
  );
}
