import { useState } from 'react';
import { booksApi } from '../../api/index.js';
import BookCover from '../../components/BookCover.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { dateOnly, errorText, money } from '../../utils/format.js';
import { StockBadge } from './ui/Badge.jsx';
import DataTable from './ui/DataTable.jsx';
import Modal, { ConfirmModal } from './ui/Modal.jsx';
import PageHeader from './ui/PageHeader.jsx';
import SearchBox from './ui/SearchBox.jsx';
import usePagedList from './ui/usePagedList.js';
import { IconEdit, IconEye, IconPlus, IconTrash } from './ui/icons.jsx';

const EMPTY = { title: '', author: '', price: '', stock: '0', category: '', isbn: '', description: '', coverImage: '' };
const SORTS = [
  ['-createdAt', 'Newest first'],
  ['title', 'Title A–Z'],
  ['price', 'Price: low to high'],
  ['-price', 'Price: high to low'],
  ['-avgRating', 'Top rated'],
];

function BookForm({ book, onClose, onSaved }) {
  const toast = useToast();
  const editing = !!book;
  const [f, setF] = useState(editing ? {
    title: book.title || '',
    author: book.author || '',
    price: book.price != null ? String(book.price / 100) : '',
    stock: String(book.stock ?? 0),
    category: book.category || '',
    isbn: book.isbn || '',
    description: book.description || '',
    coverImage: book.coverImageUrl || '',
  } : EMPTY);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const price = Math.round(Number(f.price) * 100);
    if (!Number.isFinite(price) || price < 0) return setErr('Enter a valid price');
    setBusy(true);
    try {
      const body = {
        title: f.title.trim(),
        author: f.author.trim(),
        price,
        category: f.category.trim(),
        isbn: f.isbn.trim(),
        description: f.description.trim(),
        coverImageUrl: f.coverImage.trim(),
      };
      if (editing) {
        await booksApi.update(book.id, body);
      } else {
        // optional fields are left out on create instead of being sent empty
        Object.keys(body).forEach((k) => { if (body[k] === '') delete body[k]; });
        await booksApi.create({ ...body, stock: Math.max(0, parseInt(f.stock, 10) || 0) });
      }
      toast(editing ? 'Book updated' : 'Book added');
      onSaved();
    } catch (ex) {
      setErr(errorText(ex));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={editing ? 'Edit book' : 'Add a book'}
      busy={busy}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="ad-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="book-form" className="ad-btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add book'}</button>
        </>
      )}
    >
      <form id="book-form" className="ad-form" onSubmit={submit}>
        {err && <p className="ad-err" role="alert">{err}</p>}
        <div className="ad-row2">
          <label className="ad-field"><span>Title <i className="req">*</i></span><input className="ad-input" required maxLength={255} value={f.title} onChange={set('title')} /></label>
          <label className="ad-field"><span>Author <i className="req">*</i></span><input className="ad-input" required maxLength={150} value={f.author} onChange={set('author')} /></label>
        </div>
        <div className="ad-row2">
          <label className="ad-field"><span>Price (₹) <i className="req">*</i></span><input className="ad-input" required type="number" step="0.01" min="0" value={f.price} onChange={set('price')} /></label>
          <label className="ad-field">
            <span>{editing ? 'Stock' : 'Opening stock'}</span>
            <input className="ad-input" type="number" min="0" value={f.stock} onChange={set('stock')} disabled={editing} />
            {editing && <small>Change stock from the Inventory page.</small>}
          </label>
        </div>
        <div className="ad-row2">
          <label className="ad-field"><span>Category</span><input className="ad-input" maxLength={80} value={f.category} onChange={set('category')} /></label>
          <label className="ad-field"><span>ISBN</span><input className="ad-input" maxLength={20} value={f.isbn} onChange={set('isbn')} /></label>
        </div>
        <label className="ad-field"><span>Cover image URL</span><input className="ad-input" type="url" placeholder="https://…" value={f.coverImage} onChange={set('coverImage')} /></label>
        <label className="ad-field"><span>Description</span><textarea className="ad-textarea" rows={4} maxLength={4000} value={f.description} onChange={set('description')} /></label>
      </form>
    </Modal>
  );
}

export default function AdminBooks() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';
  const list = usePagedList((p) => booksApi.list(p), { filters: { sort: '-createdAt' } });
  const [editing, setEditing] = useState(null); // null | 'new' | book
  const [deleting, setDeleting] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const confirmDelete = async () => {
    setDelBusy(true);
    try {
      await booksApi.remove(deleting.id);
      toast('Book deleted');
      setDeleting(null);
      list.reload();
    } catch (ex) {
      toast(errorText(ex), 'error');
    } finally {
      setDelBusy(false);
    }
  };

  const columns = [
    {
      key: 'book',
      header: 'Book',
      render: (b) => (
        <div className="ad-media">
          <div className="ad-thumb"><BookCover book={b} /></div>
          <div><div className="ad-cell-main ad-clip">{b.title}</div><div className="ad-cell-sub">{b.author}</div></div>
        </div>
      ),
    },
    { key: 'cat', header: 'Category', render: (b) => b.category || '—' },
    { key: 'price', header: 'Price', render: (b) => <span className="ad-num ad-cell-main">{money(b.price)}</span> },
    { key: 'stock', header: 'Stock', render: (b) => <StockBadge stock={b.stock} /> },
    { key: 'rating', header: 'Rating', render: (b) => (b.ratingCount ? <span className="ad-num">{Number(b.avgRating).toFixed(1)} <span className="ad-cell-sub">({b.ratingCount})</span></span> : '—') },
    { key: 'added', header: 'Added', render: (b) => dateOnly(b.createdAt) },
    {
      key: 'actions',
      header: '',
      width: 96,
      render: (b) => (isAdmin ? (
        <div className="ad-actions">
          <button type="button" className="ad-icon-btn" onClick={() => setEditing(b)} aria-label={`Edit ${b.title}`} title="Edit"><IconEdit /></button>
          <button type="button" className="ad-icon-btn danger" onClick={() => setDeleting(b)} aria-label={`Delete ${b.title}`} title="Delete"><IconTrash /></button>
        </div>
      ) : null),
    },
  ].filter((c) => isAdmin || c.key !== 'actions');

  return (
    <>
      <PageHeader
        title="Books"
        subtitle="Your catalogue. Search, sort and manage every title."
        actions={isAdmin
          ? <button type="button" className="ad-btn primary" onClick={() => setEditing('new')}><IconPlus size={16} /> Add book</button>
          : <span className="ad-pill-note"><IconEye size={14} /> View only</span>}
      />
      <div className="ad-toolbar">
        <SearchBox placeholder="Search by title, author…" label="Search books" onChange={(q) => list.setFilter({ q })} />
        <select className="ad-select" aria-label="Sort" value={list.params.sort} onChange={(e) => list.setFilter({ sort: e.target.value })}>
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="ad-select" aria-label="Availability" value={list.params.inStock || ''} onChange={(e) => list.setFilter({ inStock: e.target.value || undefined })}>
          <option value="">All availability</option>
          <option value="true">In stock only</option>
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle="No books found"
        emptyHint={list.params.q ? 'Try a different search term.' : 'Add your first book to get started.'}
        pagination={{ ...list.meta, page: list.params.page, limit: list.params.limit, onPage: list.setPage, onLimit: list.setLimit }}
      />

      {editing && (
        <BookForm
          book={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); list.reload(); }}
        />
      )}
      {deleting && (
        <ConfirmModal
          title="Delete this book?"
          message={`“${deleting.title}” will be removed from the storefront. This can't be undone from here.`}
          confirmLabel="Delete book"
          danger
          busy={delBusy}
          onConfirm={confirmDelete}
          onClose={() => !delBusy && setDeleting(null)}
        />
      )}
    </>
  );
}