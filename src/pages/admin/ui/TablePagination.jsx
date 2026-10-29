import { IconChevL, IconChevR, IconChevsL, IconChevsR } from './icons.jsx';

function pageList(c, t) {
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  if (t <= 7) return range(1, t);
  if (c <= 4) return [...range(1, 5), '…', t];
  if (c >= t - 3) return [1, '…', ...range(t - 4, t)];
  return [1, '…', c - 1, c, c + 1, '…', t];
}

export default function TablePagination({ page, limit, total, totalPages, onPage, onLimit, pageSizes = [10, 20, 50], busy }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="ad-pager">
      <div className="ad-pager-info">
        Showing <b>{from}–{to}</b> of <b>{total}</b>
      </div>
      <div className="ad-pager-right">
        <label className="ad-pager-size">
          <span>Rows</span>
          <select value={limit} onChange={(e) => onLimit(Number(e.target.value))} disabled={busy}>
            {pageSizes.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        {totalPages > 1 && (
          <nav className="ad-pager-nav" aria-label="Pagination">
            <button type="button" disabled={page <= 1 || busy} onClick={() => onPage(1)} aria-label="First page"><IconChevsL size={16} /></button>
            <button type="button" disabled={page <= 1 || busy} onClick={() => onPage(page - 1)} aria-label="Previous page"><IconChevL size={16} /></button>
            {pageList(page, totalPages).map((p, i) => (p === '…'
              ? <span key={`g${i}`} className="ad-pager-gap">…</span>
              : (
                <button
                  type="button"
                  key={p}
                  className={p === page ? 'on' : ''}
                  aria-current={p === page ? 'page' : undefined}
                  disabled={busy}
                  onClick={() => onPage(p)}
                >
                  {p}
                </button>
              )))}
            <button type="button" disabled={page >= totalPages || busy} onClick={() => onPage(page + 1)} aria-label="Next page"><IconChevR size={16} /></button>
            <button type="button" disabled={page >= totalPages || busy} onClick={() => onPage(totalPages)} aria-label="Last page"><IconChevsR size={16} /></button>
          </nav>
        )}
      </div>
    </div>
  );
}