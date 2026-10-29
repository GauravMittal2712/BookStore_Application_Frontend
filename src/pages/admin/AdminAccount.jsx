import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { errorText, initials, passwordError } from '../../utils/format.js';
import { RoleBadge } from './ui/Badge.jsx';
import PageHeader from './ui/PageHeader.jsx';

export default function AdminAccount() {
  const { user, forget } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const pe = passwordError(pw.newPassword);
    if (!pw.currentPassword) return setErr('Enter your current password');
    if (pe) return setErr(pe);
    setBusy(true);
    setErr('');
    try {
      await authApi.changePassword(pw);
      forget(); // the server revokes every session on a password change
      toast('Password changed. Please log in again.');
      nav('/login', { replace: true });
    } catch (ex) {
      setErr(errorText(ex));
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="My account" subtitle="Your sign-in details and password." />
      <div className="ad-account">
        <section className="ad-panel ad-panel-pad">
          <div className="ad-profile-top">
            <span className="ad-avatar" aria-hidden="true">{initials(user.name)}</span>
            <div><b>{user.name}</b><RoleBadge role={user.role} /></div>
          </div>
          <div className="ad-kv" style={{ marginBottom: 0 }}>
            <div><span>Email</span>{user.email}</div>
            <div><span>Role</span>{user.role}</div>
          </div>
        </section>
        <section className="ad-panel ad-panel-pad">
          <form className="ad-form" onSubmit={submit}>
            <h2 style={{ margin: 0, fontSize: 15 }}>Change password</h2>
            {err && <p className="ad-err" role="alert">{err}</p>}
            <label className="ad-field"><span>Current password</span><input className="ad-input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
            <label className="ad-field"><span>New password</span><input className="ad-input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /><small>Min 8 characters with upper, lower case and a digit. You will be signed out everywhere.</small></label>
            <div><button type="submit" className="ad-btn primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></div>
          </form>
        </section>
      </div>
    </>
  );
}