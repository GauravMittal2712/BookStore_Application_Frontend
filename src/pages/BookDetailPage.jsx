import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { booksApi, reviewsApi, wishlistApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import BookCover from '../components/BookCover.jsx';
import { StarInput, Stars } from '../components/Stars.jsx';
import { HeartIcon } from '../components/Icons.jsx';
import { errorText, initials, moneyTight } from '../utils/format.js';

export default function BookDetailPage() {
  const { bookId } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { add } = useCart();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rerr, setRerr] = useState('');
  const [busy, setBusy] = useState(false);

  const loadReviews = useCallback(() => reviewsApi.list(bookId).then((r) => setReviews(r.data)).catch(() => setReviews([])), [bookId]);
  useEffect(() => {
    let alive = true;
    setBook(null); setError('');
    booksApi.one(bookId).then((r) => alive && setBook(r.data)).catch((e) => alive && setError(e.status === 404 || e.status === 422 ? 'This book could not be found.' : errorText(e)));
    loadReviews();
    return () => { alive = false; };
  }, [bookId, loadReviews]);

  if (error) return <><Breadcrumb current="Book" /><p className="empty">{error}</p></>;
  if (!book) return <><Breadcrumb current="Book" /><p className="empty">Loading…</p></>;

  const oos = book.stock <= 0;
  const toLogin = () => nav('/login', { state: { from: `/books/${bookId}` } });
  const guard = () => {
    if (!user) { toLogin(); return false; }
    if (user.role !== 'customer') { toast('Only customer accounts can shop.', 'error'); return false; }
    return true;
  };
  const addToBag = async () => {
    if (!guard()) return;
    try { await add(book.id, 1); toast('Added to bag'); } catch (e) { toast(errorText(e), 'error'); }
  };
  const addWish = async () => {
    if (!guard()) return;
    try { await wishlistApi.add(book.id); toast('Added to wishlist'); } catch (e) {
      toast(e.code === 'ALREADY_IN_WISHLIST' ? 'Already in your wishlist' : errorText(e), e.code === 'ALREADY_IN_WISHLIST' ? 'info' : 'error');
    }
  };
  const submitReview = async () => {
    if (!user) return toLogin();
    if (!rating) return setRerr('Please select a star rating.');
    setBusy(true); setRerr('');
    try {
      await reviewsApi.create({ bookId: book.id, rating, ...(comment.trim() ? { comment: comment.trim() } : {}) });
      setRating(0); setComment('');
      toast('Thanks for your feedback');
      await Promise.all([loadReviews(), booksApi.one(bookId).then((r) => setBook(r.data))]);
    } catch (e) { setRerr(errorText(e)); } finally { setBusy(false); }
  };

  return (
    <div className="detail">
      <Breadcrumb current={book.title} />
      <div className="detail-grid">
        <div className="gallery">
          <div className="thumbs"><span className="thumb active"><BookCover book={book} /></span></div>
          <div className="gallery-main">
            <div className="big-img">
              <BookCover book={book} />
              {oos && <span className="oos-tag">OUT OF STOCK</span>}
            </div>
            <div className="detail-btns">
              {oos
                ? <button className="btn-red" onClick={() => toast("Back-in-stock alerts aren't available yet.")}>NOTIFY ME</button>
                : <button className="btn-red" onClick={addToBag}>ADD TO BAG</button>}
              <button className="btn-dark" onClick={addWish}><HeartIcon /> WISHLIST</button>
            </div>
          </div>
        </div>
        <div className="info">
          <h1>{book.title}</h1>
          <p className="info-by">by {book.author}</p>
          {book.ratingCount > 0 && (
            <p className="rate-row"><span className="rate">{Number(book.avgRating).toFixed(1)} ★</span><span className="rc">({book.ratingCount})</span></p>
          )}
          <p className="info-price">
            <b>{moneyTight(book.price)}</b>
            {book.originalPrice > book.price && <s>{moneyTight(book.originalPrice)}</s>}
          </p>
          <hr />
          <h2 className="bd-title"><i>•</i> Book Detail</h2>
          <p className="bd-text">{book.description || 'No description available for this book.'}</p>
          <hr />
          <h2 className="fb-title">Customer Feedback</h2>
          <div className="fb-box">
            <p className="fb-label">Overall rating</p>
            <StarInput value={rating} onChange={(n) => { setRating(n); setRerr(''); }} />
            <textarea placeholder="Write your review" value={comment} maxLength={2000} onChange={(e) => setComment(e.target.value)} aria-label="Write your review" />
            {rerr && <p className="form-err" role="alert">{rerr}</p>}
            <div className="fb-submit"><button className="btn-blue sm" onClick={submitReview} disabled={busy}>Submit</button></div>
          </div>
          <ul className="reviews">
            {reviews.map((r) => (
              <li key={r.id}>
                <span className="avatar">{initials(r.user?.name)}</span>
                <div>
                  <p className="r-name">{r.user?.name || 'Customer'}</p>
                  <Stars value={r.rating} size={15} />
                  {r.comment && <p className="r-text">{r.comment}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
