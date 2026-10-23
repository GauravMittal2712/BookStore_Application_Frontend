import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function RequireStaff({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (user.role !== 'admin' && user.role !== 'helper') return <Navigate to="/" replace />;
  return children;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <Link to="/" className="brand admin-brand">Bookstore</Link>
        <p className="admin-role">{user?.role}</p>
        <NavLink end to="/admin">Overview</NavLink>
        <NavLink to="/admin/books">Books</NavLink>
        <NavLink to="/admin/inventory">Inventory</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        {isAdmin && <NavLink to="/admin/users">Users</NavLink>}
        <button type="button" className="admin-logout" onClick={() => logout()}>Logout</button>
        <Link className="admin-store" to="/">← Storefront</Link>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}