"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./ui/Button";

interface ExportPanelProps {
  palette: string[];
}

type Format = "css" | "json" | "tailwind";

function buildExport(palette: string[], format: Format): string {
  if (format === "css") {
    return `:root {\n${palette.map((hex, i) => `  --color-${i + 1}: ${hex};`).join("\n")}\n}`;
  }
  if (format === "json") {
    return JSON.stringify(palette, null, 2);
  }
  return `colors: {\n${palette.map((hex, i) => `  huemap${i + 1}: "${hex}",`).join("\n")}\n}`;
}

const FORMATS: { id: Format; label: string }[] = [
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "tailwind", label: "Tailwind" },
];

export function ExportPanel({ palette }: ExportPanelProps) {
  const [format, setFormat] = useState<Format>("css");
  const [copied, setCopied] = useState(false);
  const code = buildExport(palette, format);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Exportar</p>
        <div className="flex gap-1 rounded-md border border-slate-200 p-0.5">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                format === f.id ? "brand-gradient text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-700">{code}</pre>
      <Button type="button" variant="secondary" className="mt-3" onClick={handleCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copiado" : "Copiar"}
      </Button>
    </div>
  );
}
