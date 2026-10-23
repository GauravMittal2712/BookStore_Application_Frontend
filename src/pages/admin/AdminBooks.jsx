import { useEffect, useState } from 'react';
import { booksApi } from '../../api/index.js';
import { errorText, money } from '../../utils/format.js';
import { useAuth } from '../../context/AuthContext.jsx';

const empty = {
  title: '',
  author: '',
  price: '',
  stock: '0',
  category: '',
  description: '',
  coverImage: '',
};

export default function AdminBooks() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await booksApi.list({ limit: 50, sort: '-createdAt' });
    setItems(Array.isArray(r.data) ? r.data : (r.data?.items || r.items || []));
  };

  useEffect(() => {
    load().catch((e) => setErr(errorText(e)));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setBusy(true);
    setErr('');
    try {
      const body = {
        title: form.title.trim(),
        author: form.author.trim(),
        price: Math.round(Number(form.price) * 100),
        category: form.category.trim() || undefined,
        description: form.description.trim() || undefined,
        coverImageUrl: form.coverImage.trim() || undefined,
      };
      if (editId) {
        await booksApi.update(editId, body);
      } else {
        await booksApi.create({ ...body, stock: Number(form.stock) || 0 });
      }
      setForm(empty);
      setEditId(null);
      await load();
    } catch (ex) {
      setErr(errorText(ex));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (b) => {
    setEditId(b.id);
    setForm({
      title: b.title || '',
      author: b.author || '',
      price: b.price != null ? String(b.price / 100) : '',
      stock: String(b.stock ?? 0),
      category: b.category || '',
      description: b.description || '',
      coverImage: b.coverImageUrl || b.coverImage || '',
    });
  };

  const remove = async (id) => {
    if (!isAdmin || !confirm('Soft-delete this book?')) return;
    try {
      await booksApi.remove(id);
      await load();
    } catch (ex) {
      setErr(errorText(ex));
    }
  };

  return (
    <div>
      <h1>Books</h1>
      {err && <p className="form-err">{err}</p>}
      {isAdmin && (
        <form className="admin-form panel pad" onSubmit={save}>
          <h3>{editId ? 'Edit book' : 'Add book'}</h3>
          <div className="row2">
            <label className="fld">
              <span>Title</span>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="fld">
              <span>Author</span>
              <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </label>
          </div>
          <div className="row2">
            <label className="fld">
              <span>Price (₹)</span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label className="fld">
              <span>Stock</span>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </label>
          </div>
          <label className="fld">
            <span>Category</span>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label className="fld">
            <span>Cover image URL</span>
            <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          </label>
          <label className="fld">
            <span>Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <div className="acc-actions">
            <button className="btn-red" disabled={busy} type="submit">
              {busy ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setEditId(null);
                  setForm(empty);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      {!isAdmin && <p className="muted">Helpers can view books; only admins create/edit/delete.</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Price</th>
            <th>Stock</th>
            {isAdmin && <th />}
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author}</td>
              <td>{money(b.price)}</td>
              <td>{b.stock}</td>
              {isAdmin && (
                <td>
                  <button type="button" className="link-red" onClick={() => startEdit(b)}>
                    Edit
                  </button>{' '}
                  <button type="button" className="link-red" onClick={() => remove(b.id)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}