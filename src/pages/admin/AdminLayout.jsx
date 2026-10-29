import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials, isStaff } from '../../utils/format.js';
import {
  IconBag, IconBook, IconBox, IconDashboard, IconLogout, IconMenu, IconUser, IconUsers,
} from './ui/icons.jsx';
import './admin.css';

export function RequireStaff({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (!isStaff(user)) return <Navigate to="/" replace />;
  return children;
}

// Pages only some staff roles may open (helpers are bounced back to the overview).
export function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <Navigate to="/admin" replace />;
  return children;
}

const NAV = [
  { to: '/admin', label: 'Overview', icon: IconDashboard, end: true, roles: ['admin', 'helper'] },
  { to: '/admin/books', label: 'Books', icon: IconBook, roles: ['admin', 'helper'] },
  { to: '/admin/inventory', label: 'Inventory', icon: IconBox, roles: ['admin', 'helper'] },
  { to: '/admin/orders', label: 'Orders', icon: IconBag, roles: ['admin'] },
  { to: '/admin/users', label: 'Users', icon: IconUsers, roles: ['admin'] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const role = user?.role;
  const items = NAV.filter((n) => n.roles.includes(role));
  const current = [...NAV, { to: '/admin/account', label: 'Account' }]
    .filter((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))
    .pop();
  const consoleName = role === 'admin' ? 'Admin console' : 'Helper console';

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { document.title = `${current?.label || 'Dashboard'} · ${consoleName}`; }, [current, consoleName]);

  const signOut = async () => {
    await logout();
    nav('/login', { replace: true });
  };

  return (
    <div className="ad-shell" data-role={role}>
      <aside className={`ad-side${open ? ' open' : ''}`} aria-label="Sidebar">
        <div className="ad-brand">
          <span className="ad-brand-mark"><IconBook size={20} /></span>
          <div>
            <b>Bookstore</b>
            <small>{role === 'admin' ? 'Admin' : 'Helper'}</small>
          </div>
        </div>
        <div className="ad-navlabel">Manage</div>
        <nav className="ad-nav">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}><Icon /> {label}</NavLink>
          ))}
        </nav>
        <div className="ad-side-foot">
          <NavLink to="/admin/account"><IconUser /> My account</NavLink>
          <button type="button" onClick={signOut}><IconLogout /> Log out</button>
        </div>
      </aside>
      {open && <button type="button" className="ad-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="ad-body">
        <header className="ad-top">
          <button type="button" className="ad-icon-btn ad-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><IconMenu /></button>
          <div className="ad-top-title">{consoleName} / <b>{current?.label || 'Overview'}</b></div>
          <div className="ad-user">
            <div className="ad-user-meta"><b>{user?.name}</b><span>{user?.email}</span></div>
            <span className="ad-avatar" aria-hidden="true">{initials(user?.name)}</span>
          </div>
        </header>
        <main className="ad-main"><Outlet /></main>
      </div>
    </div>
  );
}