"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";
import { PaletteSwatches } from "./PaletteSwatches";
import { ValidationPanel } from "./ValidationPanel";
import { CvdPreview } from "./CvdPreview";
import { ExportPanel } from "./ExportPanel";
import { DEFAULT_SURFACE, findAccessibleBaseHue, generatePalette, isHexColor, validate } from "@/lib/color";
import type { InputMode, PaletteMode } from "@/lib/types";

function parsePastedColors(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .filter(isHexColor)
    .map((v) => (v.startsWith("#") ? v : `#${v}`));
}

export function HuemapView() {
  const [inputMode, setInputMode] = useState<InputMode>("generate");
  const [mode, setMode] = useState<PaletteMode>("light");
  const [count, setCount] = useState(5);
  const [baseHue, setBaseHue] = useState(() => findAccessibleBaseHue(5, "light", 250));
  const [pasteText, setPasteText] = useState("#2a78d6, #eb6834, #1baf7a, #eda100, #e87ba4");

  // Re-search for an accessible base hue whenever the swatch count or surface
  // mode changes — evenly-spaced hues that pass at 5 colors don't necessarily
  // still pass at 8, since the pairs and their spacing change. Adjusting
  // state during render (React's documented pattern for "derive state from a
  // changed prop/state") instead of in an effect avoids an extra render pass.
  const [autoKey, setAutoKey] = useState(`${count}-${mode}`);
  const currentKey = `${count}-${mode}`;
  if (currentKey !== autoKey) {
    setAutoKey(currentKey);
    setBaseHue(findAccessibleBaseHue(count, mode, baseHue));
  }

  const generated = useMemo(
    () => generatePalette({ count, baseHue, mode }),
    [count, baseHue, mode]
  );

  const pasted = useMemo(() => parsePastedColors(pasteText), [pasteText]);

  const palette = inputMode === "generate" ? generated : pasted;
  const surface = DEFAULT_SURFACE[mode];
  const report = useMemo(() => validate(palette, mode, surface), [palette, mode, surface]);

  function regenerate() {
    const randomStart = Math.round(Math.random() * 360);
    setBaseHue(findAccessibleBaseHue(count, mode, randomStart));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="brand-gradient-text text-xl font-bold tracking-tight">Generador de paletas accesibles</h1>
        <p className="text-sm text-slate-500">
          Genera una paleta categórica o valida la tuya — contraste, y separación bajo daltonismo, calculados
          en tiempo real con el mismo método que usan las gráficas de este portafolio.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1 rounded-md border border-slate-200 p-1">
            {(
              [
                { id: "generate" as const, label: "Generar" },
                { id: "paste" as const, label: "Validar la mía" },
              ]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setInputMode(opt.id)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  inputMode === opt.id ? "brand-gradient text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 rounded-md border border-slate-200 p-1">
            {(
              [
                { id: "light" as const, label: "Superficie clara" },
                { id: "dark" as const, label: "Superficie oscura" },
              ]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === opt.id ? "brand-gradient text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {inputMode === "generate" ? (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Colores ({count})
              </span>
              <input
                type="range"
                min={2}
                max={8}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-40"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Tono base ({baseHue}°)
              </span>
              <input
                type="range"
                min={0}
                max={359}
                value={baseHue}
                onChange={(e) => setBaseHue(Number(e.target.value))}
                className="w-40"
              />
            </label>
            <Button type="button" variant="secondary" onClick={regenerate}>
              <RefreshCw size={14} /> Aleatorio
            </Button>
            {count >= 7 ? (
              <p className="w-full text-xs text-amber-600">
                A partir de 7 colores es matemáticamente difícil que todos los pares queden separados bajo
                daltonismo, incluso probando distintos tonos — si la validación de abajo marca alertas, prueba
                con menos colores o usa &quot;Aleatorio&quot; unas veces más.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4">
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Colores en hexadecimal (separados por coma o salto de línea)
              </span>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={3}
                className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
        )}
      </div>

      {palette.length > 0 ? (
        <>
          <div className="mt-6">
            <PaletteSwatches palette={palette} surface={surface} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ValidationPanel report={report} />
            <CvdPreview palette={palette} />
          </div>
          <div className="mt-6">
            <ExportPanel palette={palette} />
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          Pega al menos un color hexadecimal válido (ej. <span className="font-mono">#2a78d6</span>) para
          validarlo.
        </p>
      )}
    </div>
  );
}
