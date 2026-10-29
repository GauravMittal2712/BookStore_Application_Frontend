import TablePagination from './TablePagination.jsx';
import { IconAlert, IconInbox, IconRefresh } from './icons.jsx';

// columns: [{ key, header, render(row), width?, align?, className? }]
// pagination: { page, limit, total, totalPages, onPage, onLimit }
export default function DataTable({
  columns,
  rows,
  rowKey = 'id',
  loading = false,
  error = '',
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyHint,
  pagination,
  skeletonRows = 8,
}) {
  const firstLoad = loading && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;

  return (
    <div className="ad-tablecard">
      {error && (
        <div className="ad-state error" role="alert">
          <IconAlert size={20} />
          <span>{error}</span>
          {onRetry && <button type="button" className="ad-btn ghost sm" onClick={onRetry}><IconRefresh size={14} /> Retry</button>}
        </div>
      )}
      <div className={`ad-tablewrap${loading && rows.length > 0 ? ' busy' : ''}`}>
        <table className="ad-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width, textAlign: c.align }} scope="col">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {firstLoad && Array.from({ length: Math.min(skeletonRows, pagination?.limit || skeletonRows) }, (_, i) => (
              <tr key={`sk${i}`} className="ad-skel-row" aria-hidden="true">
                {columns.map((c) => <td key={c.key} data-label={c.header}><span className="ad-skel" /></td>)}
              </tr>
            ))}
            {!firstLoad && rows.map((row) => (
              <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey]}>
                {columns.map((c) => (
                  <td key={c.key} data-label={c.header} className={c.className} style={{ textAlign: c.align }}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showEmpty && (
        <div className="ad-state">
          <IconInbox size={28} />
          <b>{emptyTitle}</b>
          {emptyHint && <span>{emptyHint}</span>}
        </div>
      )}
      {pagination && !error && (
        <TablePagination {...pagination} busy={loading} />
      )}
    </div>
  );
}