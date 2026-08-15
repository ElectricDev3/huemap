import type { CheckState, ValidationReport } from "@/lib/color";

const STATE_STYLES: Record<CheckState, string> = {
  pass: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  fail: "bg-red-100 text-red-700",
  "n/a": "bg-slate-100 text-slate-500",
};

const STATE_LABELS: Record<CheckState, string> = {
  pass: "Pasa",
  warn: "Alerta",
  fail: "Falla",
  "n/a": "N/A",
};

export function ValidationPanel({ report }: { report: ValidationReport }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Validación de accesibilidad</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            report.ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
          {report.ok ? "Paleta válida" : "Necesita ajustes"}
        </span>
      </div>
      <div className="space-y-2.5">
        {report.checks.map((check) => (
          <div key={check.name} className="flex items-start justify-between gap-3 border-t border-slate-100 pt-2.5 first:border-t-0 first:pt-0">
            <div>
              <p className="text-sm font-medium text-slate-800">{check.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{check.detail}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATE_STYLES[check.state]}`}>
              {STATE_LABELS[check.state]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
