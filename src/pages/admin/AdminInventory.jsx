import { useState } from 'react';
import { inventoryApi } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { errorText, money } from '../../utils/format.js';
import { StockBadge } from './ui/Badge.jsx';
import DataTable from './ui/DataTable.jsx';
import PageHeader from './ui/PageHeader.jsx';
import SearchBox from './ui/SearchBox.jsx';
import usePagedList from './ui/usePagedList.js';
import { IconCheck, IconMinus, IconPlus } from './ui/icons.jsx';

const FILTERS = [
  [undefined, 'All'],
  ['true', 'Low stock (≤ 5)'],
  ['0', 'Out of stock'],
];

export default function AdminInventory() {
  const toast = useToast();
  const list = usePagedList((p) => inventoryApi.list(p));
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  const draftOf = (b) => (drafts[b.bookId] ?? String(b.stock));
  const parsed = (b) => {
    const v = draftOf(b);
    return /^\d+$/.test(v) ? Number(v) : null;
  };
  const setDraft = (id, v) => setDrafts((d) => ({ ...d, [id]: v }));

  const save = async (b) => {
    const next = parsed(b);
    if (next === null || next === b.stock) return;
    setSaving(b.bookId);
    try {
      await inventoryApi.update(b.bookId, { stock: next, reason: 'manual' });
      list.patchItem((i) => i.bookId === b.bookId, { stock: next });
      setDrafts(({ [b.bookId]: _gone, ...rest }) => rest);
      toast(`Stock for “${b.title}” set to ${next}`);
    } catch (ex) {
      toast(errorText(ex), 'error');
    } finally {
      setSaving(null);
    }
  };

  const columns = [
    {
      key: 'book',
      header: 'Book',
      render: (b) => <div><div className="ad-cell-main ad-clip">{b.title}</div><div className="ad-cell-sub">{b.author}</div></div>,
    },
    { key: 'cat', header: 'Category', render: (b) => b.category || '—' },
    { key: 'price', header: 'Price', render: (b) => <span className="ad-num">{money(b.price)}</span> },
    { key: 'stock', header: 'Status', render: (b) => <StockBadge stock={b.stock} /> },
    {
      key: 'adjust',
      header: 'Set stock',
      align: 'right',
      render: (b) => {
        const v = parsed(b);
        const dirty = v !== null && v !== b.stock;
        const busy = saving === b.bookId;
        return (
          <div className="ad-inline" style={{ justifyContent: 'flex-end' }}>
            <div className={`ad-stepper${dirty ? ' dirty' : ''}`}>
              <button type="button" aria-label="Decrease" disabled={busy || (v ?? 0) <= 0} onClick={() => setDraft(b.bookId, String(Math.max(0, (v ?? b.stock) - 1)))}><IconMinus size={14} /></button>
              <input
                inputMode="numeric"
                aria-label={`Stock for ${b.title}`}
                value={draftOf(b)}
                onChange={(e) => setDraft(b.bookId, e.target.value.replace(/[^\d]/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') save(b); }}
              />
              <button type="button" aria-label="Increase" disabled={busy} onClick={() => setDraft(b.bookId, String((v ?? b.stock) + 1))}><IconPlus size={14} /></button>
            </div>
            <button type="button" className="ad-btn primary sm" disabled={!dirty || busy} onClick={() => save(b)}>
              <IconCheck size={14} /> {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader title="Inventory" subtitle="Track stock levels and correct counts. Lowest stock is listed first." />
      <div className="ad-toolbar">
        <SearchBox placeholder="Search by title or author…" label="Search inventory" onChange={(q) => list.setFilter({ q })} />
        <div className="ad-seg" role="group" aria-label="Stock filter">
          {FILTERS.map(([v, label]) => (
            <button key={label} type="button" className={list.params.lowStock === v ? 'on' : ''} onClick={() => list.setFilter({ lowStock: v })}>{label}</button>
          ))}
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={list.items}
        rowKey="bookId"
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle="No books match"
        emptyHint="Try another search or filter."
        pagination={{ ...list.meta, page: list.params.page, limit: list.params.limit, onPage: list.setPage, onLimit: list.setLimit }}
      />
    </>
  );
}