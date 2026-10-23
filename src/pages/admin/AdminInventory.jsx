import { useEffect, useState } from 'react';
import { booksApi, inventoryApi } from '../../api/index.js';
import { errorText } from '../../utils/format.js';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    const r = await booksApi.list({ limit: 100 });
    const list = Array.isArray(r.data) ? r.data : (r.data?.items || r.items || []);
    setItems(list);
    const d = {};
    list.forEach((b) => {
      d[b.id] = String(b.stock ?? 0);
    });
    setDrafts(d);
  };

  useEffect(() => {
    load().catch((e) => setErr(errorText(e)));
  }, []);

  const save = async (bookId) => {
    setErr('');
    try {
      await inventoryApi.update(bookId, {
        stock: Number(drafts[bookId]) || 0,
        reason: 'manual',
      });
      await load();
    } catch (ex) {
      setErr(errorText(ex));
    }
  };

  return (
    <div>
      <h1>Inventory</h1>
      <p className="muted">Update stock levels (admin &amp; helper).</p>
      {err && <p className="form-err">{err}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Book</th>
            <th>Current</th>
            <th>New stock</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>
                {b.title}
                <div className="muted">{b.author}</div>
              </td>
              <td>{b.stock}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  style={{ width: 90 }}
                  value={drafts[b.id] ?? ''}
                  onChange={(e) => setDrafts({ ...drafts, [b.id]: e.target.value })}
                />
              </td>
              <td>
                <button type="button" className="btn-blue sm" onClick={() => save(b.id)}>
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}