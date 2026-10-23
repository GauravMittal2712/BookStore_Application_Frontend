import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addressApi, ordersApi, userApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import BookCover from '../components/BookCover.jsx';
import { AddressCard, AddressCreate } from '../components/Address.jsx';
import { ChevronDown, PinIcon } from '../components/Icons.jsx';
import { MOBILE_RE, errorText, money, moneyTight } from '../utils/format.js';

const uuid = () => (globalThis.crypto?.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 3) | 8).toString(16);
}));

export default function CartPage() {
  const { user, setUser } = useAuth();
  const { cart, loaded, setQty, remove, refresh } = useCart();
  const nav = useNavigate();
  const toast = useToast();
  const isCustomer = user.role === 'customer';
  const [step, setStep] = useState('cart'); // cart -> address -> summary
  const [addresses, setAddresses] = useState(null);
  const [selId, setSelId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [prof, setProf] = useState({ name: user.name, mobile: user.mobile || '' });
  const [locOpen, setLocOpen] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const keyRef = useRef(null);
  const locRef = useRef(null);

  useEffect(() => {
    if (!isCustomer) return;
    addressApi.list().then((r) => {
      setAddresses(r.data);
      const d = r.data.find((a) => a.isDefault) || r.data[0];
      if (d) setSelId(d.id);
    }).catch(() => setAddresses([]));
  }, [isCustomer]);
  useEffect(() => {
    if (!locOpen) return undefined;
    const h = (e) => { if (locRef.current && !locRef.current.contains(e.target)) setLocOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [locOpen]);

  if (!isCustomer) {
    return <><Breadcrumb current="My cart" /><p className="empty">The cart is only available for customer accounts.</p></>;
  }

  const items = cart.items;
  const selected = addresses?.find((a) => a.id === selId);
  const changeQty = async (item, q) => {
    if (q < 1) return;
    try { await setQty(item.id, q); setErr(''); } catch (e) { toast(errorText(e), 'error'); }
  };
  const removeItem = async (item) => {
    try { await remove(item.id); setErr(''); } catch (e) { toast(errorText(e), 'error'); }
  };

  const placeOrderClick = () => {
    if (!items.length) return setErr('Your cart is empty.');
    if (items.some((i) => i.book.stock < i.quantity)) return setErr('Some items are out of stock or exceed the available quantity. Please update your cart.');
    setErr(''); setStep('address');
  };
  const continueClick = async () => {
    if (adding) return setErr('Please save the new address first.');
    if (!selected) return setErr('Please add a delivery address.');
    if (!prof.name.trim()) return setErr('Please enter your full name.');
    if (prof.mobile.trim() && !MOBILE_RE.test(prof.mobile.trim())) return setErr('Please enter a valid mobile number.');
    setBusy(true); setErr('');
    try {
      const patch = {};
      if (prof.name.trim() !== user.name) patch.name = prof.name.trim();
      if (prof.mobile.trim() && prof.mobile.trim() !== (user.mobile || '')) patch.mobile = prof.mobile.trim();
      if (Object.keys(patch).length) { const { data } = await userApi.update(user.id, patch); setUser({ ...user, ...data }); }
      setStep('summary');
    } catch (e) { setErr(errorText(e)); } finally { setBusy(false); }
  };
  const checkout = async () => {
    setBusy(true); setErr('');
    keyRef.current = keyRef.current || uuid();
    try {
      const { data: order } = await ordersApi.place(selected.id, keyRef.current);
      keyRef.current = null;
      await refresh();
      nav('/order-success', { replace: true, state: { order, address: selected } });
    } catch (e) {
      if (e.status && e.status < 500) keyRef.current = null; // definitive failure -> next attempt is a new order
      setErr(errorText(e));
      refresh();
    } finally { setBusy(false); }
  };

  const loc = selected ? `${selected.street}` : 'Use current location';
  return (
    <>
      <Breadcrumb current="My cart" />
      <div className="cart-col">
        <section className="panel cart-panel">
          <div className="cart-top">
            <h1>My cart ({cart.totalItems})</h1>
            <div className="loc" ref={locRef}>
              <button className="loc-btn" onClick={() => setLocOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={locOpen}>
                <PinIcon /><span className="loc-text">{loc}</span><ChevronDown />
              </button>
              {locOpen && (
                <ul className="loc-list" role="listbox">
                  {addresses?.length ? addresses.map((a, i) => (
                    <li key={a.id} role="option" aria-selected={a.id === selId}>
                      <button onClick={() => { setSelId(a.id); setLocOpen(false); }}><b>{i + 1}.{(a.type || 'home').toUpperCase()}</b> {a.street}, {a.city}</button>
                    </li>
                  )) : <li className="loc-empty">No saved addresses yet. Add one below.</li>}
                </ul>
              )}
            </div>
          </div>
          {!loaded && <p className="empty">Loading…</p>}
          {loaded && !items.length && <p className="empty">Your cart is empty. <Link to="/" className="link-red">Continue shopping</Link></p>}
          {items.map((item) => (
            <article className="cart-item" key={item.id}>
              <Link to={`/books/${item.book.id}`} className="ci-cover"><BookCover book={item.book} /></Link>
              <div className="ci-info">
                <Link to={`/books/${item.book.id}`}><h3>{item.book.title}</h3></Link>
                <p className="by">by {item.book.author}</p>
                <p className="price-row"><b>{money(item.book.price)}</b>{item.book.originalPrice > item.book.price && <s>{moneyTight(item.book.originalPrice)}</s>}</p>
                {item.book.stock < item.quantity && <p className="form-err">{item.book.stock <= 0 ? 'Out of stock' : `Only ${item.book.stock} left`}</p>}
                <div className="qty">
                  <button className="qty-btn" disabled={item.quantity <= 1} onClick={() => changeQty(item, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                  <input readOnly value={item.quantity} aria-label="Quantity" />
                  <button className="qty-btn" disabled={item.quantity >= item.book.stock} onClick={() => changeQty(item, item.quantity + 1)} aria-label="Increase quantity">+</button>
                  <button className="remove" onClick={() => removeItem(item)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
          {step === 'cart' && items.length > 0 && (
            <div className="cart-actions"><button className="btn-blue" onClick={placeOrderClick}>PLACE ORDER</button></div>
          )}
          {step === 'cart' && err && <p className="form-err pad">{err}</p>}
        </section>

        <section className={`panel acc${step === 'address' ? ' open' : ''}`}>
          <header className="acc-head">
            <h2>{step === 'cart' ? 'Address Details' : 'Customer Details'}</h2>
            {step === 'address' && addresses?.length > 0 && !adding && (
              <button className="btn-outline sm" onClick={() => setAdding(true)}>Add New Address</button>
            )}
            {step === 'summary' && <button className="link-red" onClick={() => setStep('address')}>Change</button>}
          </header>
          {step === 'address' && (
            <div className="acc-body">
              <div className="row2">
                <label className="fld"><span>Full Name</span><input value={prof.name} maxLength={100} onChange={(e) => setProf({ ...prof, name: e.target.value })} /></label>
                <label className="fld"><span>Mobile Number</span><input type="tel" value={prof.mobile} maxLength={20} onChange={(e) => setProf({ ...prof, mobile: e.target.value })} /></label>
              </div>
              {addresses === null && <p className="empty">Loading addresses…</p>}
              {addresses?.map((a, i) => (
                <AddressCard key={a.id} address={a} index={i} selectable selected={a.id === selId} onSelect={setSelId}
                  onSaved={(n) => setAddresses((l) => l.map((x) => (x.id === n.id ? n : x)))}
                  onRemoved={(id) => { setAddresses((l) => l.filter((x) => x.id !== id)); if (id === selId) setSelId(null); }} />
              ))}
              {addresses && (adding || addresses.length === 0) && (
                <AddressCreate onCancel={addresses.length ? () => setAdding(false) : undefined}
                  onCreated={(a) => { setAddresses((l) => [...l, a]); setSelId(a.id); setAdding(false); }} />
              )}
              {err && <p className="form-err">{err}</p>}
              <div className="acc-actions"><button className="btn-blue" disabled={busy} onClick={continueClick}>CONTINUE</button></div>
            </div>
          )}
        </section>

        <section className={`panel acc${step === 'summary' ? ' open' : ''}`}>
          <header className="acc-head"><h2>Order Summary</h2></header>
          {step === 'summary' && (
            <div className="acc-body">
              <ul className="sum-list">
                {items.map((i) => (
                  <li key={i.id}><span>{i.book.title} <em>× {i.quantity}</em></span><b>{money(i.lineTotal)}</b></li>
                ))}
              </ul>
              <p className="sum-total"><span>Total</span><b>{money(cart.subtotal)}</b></p>
              {selected && <p className="sum-addr"><b>Deliver to:</b> {selected.street}, {selected.city}, {selected.state} {selected.zipCode}</p>}
              {err && <p className="form-err">{err}</p>}
              <div className="acc-actions"><button className="btn-blue" disabled={busy || !items.length} onClick={checkout}>{busy ? 'PLACING ORDER…' : 'CHECKOUT'}</button></div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
