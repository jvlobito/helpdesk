import Link from "next/link";

type RouteCardProps = {
  href: string;
  title: string;
  description: string;
};

export function RouteCard({ href, title, description }: RouteCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/40 hover:bg-white/8"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-emerald-300 transition group-hover:translate-x-0.5">Abrir</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      <p className="mt-4 text-xs text-slate-500">{href}</p>
    </Link>
  );
}
