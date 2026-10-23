import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CartIcon, LogoBook, PersonIcon, SearchIcon } from './Icons.jsx';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Bookstore home">
      <LogoBook /><span>Bookstore</span>
    </Link>
  );
}

export default function Header({ bare = false }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [sp] = useSearchParams();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [q, setQ] = useState(pathname === '/' ? sp.get('q') || '' : '');
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { if (pathname === '/') setQ(sp.get('q') || ''); }, [pathname, sp]);
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  const submit = (e) => {
    e.preventDefault();
    const t = q.trim();
    nav(t ? `/?q=${encodeURIComponent(t)}` : '/');
  };

  return (
    <header className="header">
      <div className="header-in">
        <Logo />
        {!bare && (
          <>
            <form className="search" role="search" onSubmit={submit}>
              <SearchIcon />
              <input
                type="search"
                placeholder="Search ..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search books"
              />
            </form>
            <div className="hbtns">
              <div className="hbtn-wrap" ref={menuRef}>
                {user ? (
                  <button
                    className="hbtn"
                    onClick={() => setOpen((o) => !o)}
                    aria-haspopup="menu"
                    aria-expanded={open}
                  >
                    <PersonIcon /><span>Profile</span>
                  </button>
                ) : (
                  <Link className="hbtn" to="/login">
                    <PersonIcon /><span>Profile</span>
                  </Link>
                )}
                {open && user && (
                  <div className="menu" role="menu">
                    <div className="menu-head">Hello, {user.name.split(' ')[0]}</div>
                    <Link role="menuitem" to="/profile">Profile</Link>
                    <Link role="menuitem" to="/orders">My Orders</Link>
                    <Link role="menuitem" to="/wishlist">My Wishlist</Link>
                    {(user.role === 'admin' || user.role === 'helper') && (
                      <Link role="menuitem" to="/admin">Dashboard</Link>
                    )}
                    <button
                      role="menuitem"
                      onClick={async () => {
                        setOpen(false);
                        await logout();
                        nav('/');
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <Link className="hbtn" to="/cart" aria-label={`Cart, ${count} items`}>
                <span className="cart-ico">
                  <CartIcon />
                  {count > 0 && <i className="badge">{count}</i>}
                </span>
                <span>Cart</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}