import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksApi, inventoryApi, ordersApi, usersApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { dateOnly, money } from '../../utils/format.js';
import { OrderBadge, StockBadge } from './ui/Badge.jsx';
import PageHeader from './ui/PageHeader.jsx';
import { IconAlert, IconBag, IconBook, IconBox, IconUsers } from './ui/icons.jsx';

const val = (r) => (r.status === 'fulfilled' ? r.value : null);

function Stat({ to, icon: Icon, tone = '', label, value }) {
  const body = (
    <>
      <span className={`ad-stat-ico ${tone}`}><Icon size={22} /></span>
      <div><span>{label}</span><b>{value ?? '—'}</b></div>
    </>
  );
  return to ? <Link to={to} className="ad-stat">{body}</Link> : <div className="ad-stat">{body}</div>;
}

export default function AdminHome() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [d, setD] = useState({ loading: true });

  useEffect(() => {
    let live = true;
    (async () => {
      const calls = [
        booksApi.list({ limit: 1 }),
        inventoryApi.list({ lowStock: 'true', limit: 6 }),
        inventoryApi.list({ lowStock: '0', limit: 1 }),
      ];
      if (isAdmin) {
        calls.push(
          ordersApi.list({ limit: 6 }),
          ordersApi.list({ status: 'pending', limit: 1 }),
          usersApi.list({ limit: 1 }),
        );
      }
      const res = await Promise.allSettled(calls);
      if (!live) return;
      const [books, low, out, orders, pending, users] = res.map(val);
      setD({
        loading: false,
        books: books?.meta?.total,
        low: low?.meta?.total,
        lowItems: low?.data || [],
        out: out?.meta?.total,
        orders: orders?.meta?.total,
        recent: orders?.data || [],
        pending: pending?.meta?.total,
        users: users?.meta?.total,
      });
    })();
    return () => { live = false; };
  }, [isAdmin]);

  const dash = (v) => (d.loading ? '…' : v);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader
        title={`${greet}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle={isAdmin
          ? 'Here is what is happening in your store today.'
          : 'Keep an eye on stock levels and keep the shelves filled.'}
      />

      <div className="ad-stats">
        <Stat to="/admin/books" icon={IconBook} label="Total books" value={dash(d.books)} />
        <Stat to="/admin/inventory" icon={IconAlert} tone="warn" label="Low stock (≤ 5)" value={dash(d.low)} />
        <Stat to="/admin/inventory" icon={IconBox} tone="danger" label="Out of stock" value={dash(d.out)} />
        {isAdmin && <Stat to="/admin/orders" icon={IconBag} tone="info" label="Pending orders" value={dash(d.pending)} />}
        {isAdmin && <Stat to="/admin/orders" icon={IconBag} label="All orders" value={dash(d.orders)} />}
        {isAdmin && <Stat to="/admin/users" icon={IconUsers} label="Users" value={dash(d.users)} />}
      </div>

      <div className="ad-grid2">
        <section className="ad-panel">
          <div className="ad-panel-head"><h2>Needs restocking</h2><Link to="/admin/inventory">Manage inventory</Link></div>
          {!d.loading && d.lowItems.length === 0
            ? <div className="ad-state"><b>All stocked up</b><span>No book is at or below 5 copies.</span></div>
            : (
              <table className="ad-table">
                <thead><tr><th>Book</th><th style={{ textAlign: 'right' }}>Stock</th></tr></thead>
                <tbody>
                  {d.loading && [0, 1, 2, 3].map((i) => <tr key={i} className="ad-skel-row"><td data-label="Book"><span className="ad-skel" /></td><td data-label="Stock"><span className="ad-skel" /></td></tr>)}
                  {(d.lowItems || []).map((b) => (
                    <tr key={b.bookId}>
                      <td data-label="Book"><div className="ad-cell-main ad-clip">{b.title}</div><div className="ad-cell-sub">{b.author}</div></td>
                      <td data-label="Stock" style={{ textAlign: 'right' }}><StockBadge stock={b.stock} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </section>

        {isAdmin ? (
          <section className="ad-panel">
            <div className="ad-panel-head"><h2>Recent orders</h2><Link to="/admin/orders">View all</Link></div>
            {!d.loading && d.recent.length === 0
              ? <div className="ad-state"><b>No orders yet</b></div>
              : (
                <table className="ad-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {d.loading && [0, 1, 2, 3].map((i) => <tr key={i} className="ad-skel-row">{[0, 1, 2, 3].map((j) => <td key={j} data-label=""><span className="ad-skel" /></td>)}</tr>)}
                    {(d.recent || []).map((o) => (
                      <tr key={o.id}>
                        <td data-label="Order"><span className="ad-mono">#{o.id.slice(-8)}</span><div className="ad-cell-sub">{dateOnly(o.createdAt)}</div></td>
                        <td data-label="Customer">{o.customer?.name || '—'}</td>
                        <td data-label="Total" className="ad-num">{money(o.totalAmount)}</td>
                        <td data-label="Status"><OrderBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </section>
        ) : (
          <section className="ad-panel">
            <div className="ad-panel-head"><h2>Your access</h2></div>
            <div className="ad-panel-pad">
              <p style={{ margin: '0 0 8px', lineHeight: 1.6 }}>As a helper you can update stock levels and browse the catalogue.</p>
              <p className="ad-cell-sub" style={{ margin: 0 }}>Creating or deleting books, orders and users are admin-only.</p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}