import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import BookCover from '../components/BookCover.jsx';
import { HeartDoc, TrashIcon } from '../components/Icons.jsx';
import { errorText, money, moneyTight, pad2 } from '../utils/format.js';

export default function WishlistPage() {
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!user) return;
    wishlistApi.list().then((r) => setItems(r.data)).catch((e) => { setItems([]); toast(errorText(e), 'error'); });
  }, [user, toast]);

  if (!ready) return <p className="empty">Loading…</p>;
  if (!user) {
    return (
      <div className="login-prompt">
        <h1>PLEASE LOG IN</h1>
        <p>Login to view items in your wishlist.</p>
        <HeartDoc />
        <button className="btn-outline" onClick={() => nav('/login', { state: { from: '/wishlist' } })}>LOGIN/SIGNUP</button>
      </div>
    );
  }
  const remove = async (bookId) => {
    try { await wishlistApi.remove(bookId); setItems((l) => l.filter((i) => i.book.id !== bookId)); } catch (e) { toast(errorText(e), 'error'); }
  };
  return (
    <>
      <Breadcrumb current="My Wishlist" />
      <section className="panel">
        <header className="panel-bar"><b>My Wishlist ({pad2(items?.length ?? 0)})</b></header>
        {items === null && <p className="empty">Loading…</p>}
        {items?.length === 0 && <p className="empty">Your wishlist is empty. <Link to="/" className="link-red">Browse books</Link></p>}
        {items?.map(({ id, book }) => (
          <article className="row-item" key={id}>
            <Link to={`/books/${book.id}`} className="ri-cover"><BookCover book={book} /></Link>
            <div className="ri-info">
              <Link to={`/books/${book.id}`}><h3>{book.title}</h3></Link>
              <p className="by">by {book.author}</p>
              <p className="price-row"><b>{money(book.price)}</b>{book.originalPrice > book.price && <s>{moneyTight(book.originalPrice)}</s>}</p>
            </div>
            <button className="ri-trash" onClick={() => remove(book.id)} aria-label={`Remove ${book.title} from wishlist`}><TrashIcon /></button>
          </article>
        ))}
      </section>
    </>
  );
}
