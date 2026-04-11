type TicketPaginationProps = {
  basePath: string;
  page: number;
  totalItems: number;
  totalPages: number;
  filters: Record<string, string | undefined>;
};

function buildPageUrl(basePath: string, filters: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function TicketPagination({ basePath, page, totalItems, totalPages, filters }: TicketPaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="text-sm text-slate-400">
        {totalItems} resultado{totalItems === 1 ? "" : "s"}.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-card px-4 py-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Pagina {page} de {totalPages} · {totalItems} resultado{totalItems === 1 ? "" : "s"}
      </span>
      <div className="flex gap-3">
        <a
          href={page > 1 ? buildPageUrl(basePath, filters, page - 1) : undefined}
          aria-disabled={page <= 1}
          className="rounded-xl border border-white/10 px-4 py-2 text-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Anterior
        </a>
        <a
          href={page < totalPages ? buildPageUrl(basePath, filters, page + 1) : undefined}
          aria-disabled={page >= totalPages}
          className="rounded-xl border border-white/10 px-4 py-2 text-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Siguiente
        </a>
      </div>
    </div>
  );
}
