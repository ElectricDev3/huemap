import { simulateToHex } from "@/lib/color";

interface CvdPreviewProps {
  palette: string[];
}

const KINDS = [
  { id: "protan" as const, label: "Protanopía" },
  { id: "deutan" as const, label: "Deuteranopía" },
  { id: "tritan" as const, label: "Tritanopía" },
];

export function CvdPreview({ palette }: CvdPreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="mb-3 text-sm font-medium text-slate-700">Simulación de daltonismo</p>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-xs text-slate-500">Normal</span>
          <div className="flex flex-1 overflow-hidden rounded">
            {palette.map((hex, i) => (
              <div key={i} className="h-8 flex-1" style={{ background: hex }} />
            ))}
          </div>
        </div>
        {KINDS.map((kind) => (
          <div key={kind.id} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-xs text-slate-500">{kind.label}</span>
            <div className="flex flex-1 overflow-hidden rounded">
              {palette.map((hex, i) => (
                <div key={i} className="h-8 flex-1" style={{ background: simulateToHex(hex, kind.id) }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
