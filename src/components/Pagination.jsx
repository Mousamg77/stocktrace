import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;

  const getPages = () => {
    const pages_arr = [];
    const delta = 1;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) pages_arr.push(i);
    if (pages_arr[0] > 1) { pages_arr.unshift('...'); pages_arr.unshift(1); }
    if (pages_arr[pages_arr.length - 1] < pages) { pages_arr.push('...'); pages_arr.push(pages); }
    return pages_arr;
  };

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-sm text-slate-500">
        Showing {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={i} className="px-2 text-slate-400 text-sm">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
