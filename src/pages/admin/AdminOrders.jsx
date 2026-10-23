import { useEffect, useState } from 'react';
import { ordersApi } from '../../api/index.js';
import { errorText, money } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    const r = await ordersApi.list({ limit: 50 });
    setItems(Array.isArray(r.data) ? r.data : (r.data?.items || r.items || []));
  };

  useEffect(() => {
    load().catch((e) => setErr(errorText(e)));
  }, []);

  const change = async (id, status) => {
    if (!isAdmin) return;
    setErr('');
    try {
      await ordersApi.changeStatus(id, status);
      await load();
    } catch (ex) {
      setErr(errorText(ex));
    }
  };

  return (
    <div>
      <h1>Orders</h1>
      {!isAdmin && <p className="muted">Helpers can view orders; only admins change status.</p>}
      {err && <p className="form-err">{err}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            {isAdmin && <th>Update</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td><code>{o.id?.slice(-8)}</code></td>
              <td>{money(o.totalAmount)}</td>
              <td>
                <span className={`badge-status ${o.status}`}>{o.status}</span>
              </td>
              <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
              {isAdmin && (
                <td>
                  <select value={o.status} onChange={(e) => change(o.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}