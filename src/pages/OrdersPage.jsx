import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksApi, ordersApi } from '../api/index.js';
import Breadcrumb from '../components/Breadcrumb.jsx';
import BookCover from '../components/BookCover.jsx';
import { errorText, money, shortDate } from '../utils/format.js';

const LABEL = { pending: 'Order Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

function statusDate(order) {
  const h = [...(order.statusHistory || [])].reverse().find((x) => x.status === order.status);
  return shortDate(h?.at || order.createdAt);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  const [meta, setMeta] = useState(null);
  const [books, setBooks] = useState({});
  const [error, setError] = useState('');
  const [more, setMore] = useState(false);

  const loadBooks = (list) => {
    const ids = [...new Set(list.flatMap((o) => o.items.map((i) => i.book)))];
    ids.forEach((id) => {
      booksApi.one(id).then((r) => setBooks((b) => ({ ...b, [id]: r.data }))).catch(() => setBooks((b) => ({ ...b, [id]: null })));
    });
  };
  const load = async (page) => {
    try {
      const r = await ordersApi.list({ page, limit: 20 });
      setOrders((cur) => (page === 1 ? r.data : [...(cur || []), ...r.data]));
      setMeta(r.meta);
      loadBooks(r.data);
    } catch (e) { setError(errorText(e)); }
  };
  useEffect(() => { load(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = (orders || []).flatMap((o) => o.items.map((it, idx) => ({ o, it, key: `${o.id}-${idx}` })));
  return (
    <>
      <Breadcrumb current="My Order" />
      {error && <p className="form-err center" role="alert">{error}</p>}
      {orders === null && !error && <p className="empty">Loading…</p>}
      {orders?.length === 0 && <p className="empty">You have no orders yet. <Link to="/" className="link-red">Start shopping</Link></p>}
      {rows.map(({ o, it, key }) => {
        const b = books[it.book];
        const cover = b || { title: it.title, author: '' };
        return (
          <article className="panel order-row" key={key}>
            <div className="ri-cover">{b !== undefined ? <BookCover book={cover} /> : <span className="cover-ph" />}</div>
            <div className="ri-info">
              {b ? <Link to={`/books/${b.id}`}><h3>{it.title}</h3></Link> : <h3>{it.title}</h3>}
              {b?.author && <p className="by">by {b.author}</p>}
              <p className="price-row"><b>{money(it.price)}</b>{it.quantity > 1 && <span className="qty-note">× {it.quantity}</span>}</p>
            </div>
            <p className={`order-status st-${o.status}`}><i />{LABEL[o.status] || o.status} on {statusDate(o)}</p>
          </article>
        );
      })}
      {meta && meta.page < meta.totalPages && (
        <div className="center"><button className="btn-outline" disabled={more} onClick={async () => { setMore(true); await load(meta.page + 1); setMore(false); }}>LOAD MORE</button></div>
      )}
    </>
  );
}
