import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { booksApi } from '../api/index.js';
import BookCover from '../components/BookCover.jsx';
import Pagination from '../components/Pagination.jsx';
import { ChevronDown } from '../components/Icons.jsx';
import { PAGE_SIZE } from '../config.js';
import { errorText, money, moneyTight } from '../utils/format.js';

const SORTS = [
  ['', 'Sort by relevance'],
  ['price', 'Price: Low to High'],
  ['-price', 'Price: High to Low'],
  ['-createdAt', 'Newest Arrivals'],
  ['-avgRating', 'Top Rated'],
  ['title', 'Title: A to Z'],
];

export function BookCard({ book }) {
  const oos = book.stock <= 0;
  return (
    <Link to={`/books/${book.id}`} className={`card${oos ? ' oos' : ''}`}>
      <div className="card-img">
        <BookCover book={book} />
        {oos && <span className="oos-tag">OUT OF STOCK</span>}
      </div>
      <div className="card-info">
        <h3>{book.title}</h3>
        <p className="by">by {book.author}</p>
        {book.ratingCount > 0 && (
          <p className="rate-row"><span className="rate">{Number(book.avgRating).toFixed(1)} ★</span><span className="rc">({book.ratingCount})</span></p>
        )}
        <p className="price-row">
          <b>{money(book.price)}</b>
          {book.originalPrice > book.price && <s>{moneyTight(book.originalPrice)}</s>}
        </p>
      </div>
    </Link>
  );
}

export default function BooksPage() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const sort = sp.get('sort') || '';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
  const [st, setSt] = useState({ loading: true, error: '', items: [], meta: null });

  useEffect(() => {
    let alive = true;
    setSt((s) => ({ ...s, loading: true, error: '' }));
    booksApi.list({ page, limit: PAGE_SIZE, sort, q })
      .then((r) => alive && setSt({ loading: false, error: '', items: r.data, meta: r.meta }))
      .catch((e) => alive && setSt({ loading: false, error: errorText(e), items: [], meta: null }));
    return () => { alive = false; };
  }, [page, sort, q]);

  const update = (patch) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    setSp(n);
  };

  return (
    <div className="books-page">
      <div className="books-head">
        <h1>Books{st.meta && <small> ({st.meta.total} items)</small>}</h1>
        <label className="sort">
          <select value={sort} onChange={(e) => update({ sort: e.target.value, page: '' })} aria-label="Sort books">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <ChevronDown />
        </label>
      </div>
      {q && <p className="search-note">Results for “{q}”</p>}
      {st.error && <p className="form-err center" role="alert">{st.error}</p>}
      {st.loading && !st.items.length && (
        <div className="grid" aria-busy="true">{Array.from({ length: 8 }, (_, i) => <div className="card skeleton" key={i} />)}</div>
      )}
      {!st.loading && !st.error && !st.items.length && <p className="empty">No books found.</p>}
      {st.items.length > 0 && (
        <div className="grid" style={{ opacity: st.loading ? 0.6 : 1 }}>
          {st.items.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
      {st.meta && <Pagination page={st.meta.page} totalPages={st.meta.totalPages} onChange={(p) => { update({ page: p > 1 ? String(p) : '' }); window.scrollTo(0, 0); }} />}
    </div>
  );
}
