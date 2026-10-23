import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressApi, authApi, userApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { AddressCard, AddressCreate } from '../components/Address.jsx';
import { MOBILE_RE, errorText, passwordError } from '../utils/format.js';

export default function ProfilePage() {
  const { user, setUser, forget } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({ name: user.name, email: user.email, mobile: user.mobile || '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwErr, setPwErr] = useState('');
  const [addresses, setAddresses] = useState(null);
  const [adding, setAdding] = useState(false);
  const isCustomer = user.role === 'customer';

  useEffect(() => {
    if (!isCustomer) { setAddresses([]); return; }
    addressApi.list().then((r) => setAddresses(r.data)).catch(() => setAddresses([]));
  }, [isCustomer]);

  const save = async () => {
    if (!f.name.trim()) return setErr('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setErr('Please enter a valid email id.');
    if (f.mobile.trim() && !MOBILE_RE.test(f.mobile.trim())) return setErr('Please enter a valid mobile number.');
    setBusy(true); setErr('');
    try {
      const patch = { name: f.name.trim(), email: f.email.trim() };
      if (f.mobile.trim()) patch.mobile = f.mobile.trim();
      const { data } = await userApi.update(user.id, patch);
      setUser({ ...user, ...data });
      setEditing(false);
      toast('Profile updated');
    } catch (e) { setErr(errorText(e)); } finally { setBusy(false); }
  };
  const cancel = () => { setF({ name: user.name, email: user.email, mobile: user.mobile || '' }); setEditing(false); setErr(''); };
  const changePw = async () => {
    const pe = passwordError(pw.newPassword);
    if (!pw.currentPassword) return setPwErr('Enter your current password.');
    if (pe) return setPwErr(pe);
    setBusy(true); setPwErr('');
    try {
      await authApi.changePassword(pw);
      forget(); // the server revokes every session on a password change
      toast('Password changed. Please log in again.');
      nav('/login', { replace: true });
    } catch (e) { setPwErr(errorText(e)); setBusy(false); }
  };

  return (
    <>
      <Breadcrumb current="Profile" />
      <div className="profile">
        <section className="pf-sec">
          <h1>Personal Details {!editing && <button className="link-red" onClick={() => setEditing(true)}>Edit</button>}</h1>
          <label className="fld grey"><span>Full Name</span>
            <input disabled={!editing} value={editing ? f.name : user.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={100} />
          </label>
          <label className="fld grey"><span>Email Id</span>
            <input type="email" disabled={!editing} value={editing ? f.email : user.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </label>
          <label className="fld grey"><span>Password {editing && <button type="button" className="link-red" onClick={() => setPwOpen((o) => !o)}>{pwOpen ? 'Cancel' : 'Change'}</button>}</span>
            <input disabled value="••••••••••" readOnly />
          </label>
          {pwOpen && editing && (
            <div className="pw-box">
              <label className="fld"><span>Current password</span><input type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
              <label className="fld"><span>New password</span><input type="password" autoComplete="new-password" maxLength={72} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
              {pwErr && <p className="form-err">{pwErr}</p>}
              <button className="btn-blue sm" disabled={busy} onClick={changePw}>Update password</button>
            </div>
          )}
          <label className="fld grey"><span>Mobile Number</span>
            <input type="tel" disabled={!editing} value={editing ? f.mobile : user.mobile || ''} placeholder={editing ? '' : '—'} onChange={(e) => setF({ ...f, mobile: e.target.value })} maxLength={20} />
          </label>
          {editing && (
            <div className="addr-actions">
              <button className="btn-blue sm" disabled={busy} onClick={save}>Save</button>
              <button className="btn-ghost" disabled={busy} onClick={cancel}>Cancel</button>
            </div>
          )}
          {err && <p className="form-err">{err}</p>}
        </section>

        {isCustomer && (
          <section className="pf-sec">
            <div className="pf-head">
              <h1>Address Details</h1>
              {!adding && <button className="btn-outline sm" onClick={() => setAdding(true)}>Add New Address</button>}
            </div>
            {addresses === null && <p className="empty">Loading…</p>}
            {addresses?.length === 0 && !adding && <p className="muted">No saved addresses yet.</p>}
            {addresses?.map((a, i) => (
              <AddressCard key={a.id} address={a} index={i}
                onSaved={(n) => setAddresses((l) => l.map((x) => (x.id === n.id ? n : x)))}
                onRemoved={(id) => setAddresses((l) => l.filter((x) => x.id !== id))} />
            ))}
            {adding && <AddressCreate onCancel={() => setAdding(false)} onCreated={(a) => { setAddresses((l) => [...l, a]); setAdding(false); }} />}
          </section>
        )}
      </div>
    </>
  );
}
