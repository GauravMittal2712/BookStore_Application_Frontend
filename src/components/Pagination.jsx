import { ArrowLeft, ArrowRight } from './Icons.jsx';

function pageList(c, total) {
  if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1);
  if (c <= 6) return [...Array.from({ length: 8 }, (_, i) => i + 1), '…', total];
  if (c >= total - 5) return [1, '…', ...Array.from({ length: 8 }, (_, i) => total - 7 + i)];
  return [1, '…', c - 2, c - 1, c, c + 1, c + 2, '…', total];
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button className="pager-arrow" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ArrowLeft /></button>
      {pageList(page, totalPages).map((p, i) => p === '…'
        ? <span className="pager-gap" key={`g${i}`}>…</span>
        : <button key={p} className={`pager-num${p === page ? ' active' : ''}`} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
      <button className="pager-arrow" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page"><ArrowRight /></button>
    </nav>
  );
}
