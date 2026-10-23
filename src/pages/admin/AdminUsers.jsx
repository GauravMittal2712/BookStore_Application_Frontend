import { useEffect, useState } from 'react';
import { usersApi } from '../../api/index.js';
import { errorText } from '../../utils/format.js';

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    usersApi
      .list({ limit: 100 })
      .then((r) => setItems(Array.isArray(r.data) ? r.data : (r.data?.items || r.items || [])))
      .catch((e) => setErr(errorText(e)));
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <p className="muted">Admin only.</p>
      {err && <p className="form-err">{err}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Mobile</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.mobile || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}