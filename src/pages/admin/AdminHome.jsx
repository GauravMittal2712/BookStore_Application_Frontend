import { useEffect, useState } from 'react';
import { booksApi, ordersApi, usersApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: '—', orders: '—', users: '—' });

  useEffect(() => {
    (async () => {
      try {
        const [b, o] = await Promise.all([
          booksApi.list({ limit: 1 }),
          ordersApi.list({ limit: 1 }),
        ]);
        let users = '—';
        if (user.role === 'admin') {
          try {
            const u = await usersApi.list({ limit: 1 });
            users = u.meta?.total ?? '—';
          } catch {
            /* helpers cannot list users */
          }
        }
        setStats({
          books: b.meta?.total ?? '—',
          orders: o.meta?.total ?? '—',
          users,
        });
      } catch {
        /* ignore */
      }
    })();
  }, [user]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Signed in as {user?.name} ({user?.role})</p>
      <div className="admin-cards">
        <div className="admin-card"><h3>Books</h3><b>{stats.books}</b></div>
        <div className="admin-card"><h3>Orders</h3><b>{stats.orders}</b></div>
        {user?.role === 'admin' && (
          <div className="admin-card"><h3>Users</h3><b>{stats.users}</b></div>
        )}
      </div>
      <p className="muted" style={{ marginTop: 24 }}>
        Use the sidebar to manage catalog, stock, and order status.
        {user?.role === 'helper' && ' Helpers can update inventory and view orders.'}
      </p>
    </div>
  );
}