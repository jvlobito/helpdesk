type SummaryCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-card p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </article>
  );
}
