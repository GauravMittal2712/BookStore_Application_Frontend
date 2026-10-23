import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/index.js';
import { errorText, passwordError } from '../utils/format.js';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const pe = passwordError(password);
    if (pe) { setErr(pe); return; }
    if (password !== confirm) { setErr('Passwords do not match'); return; }
    if (!token) { setErr('Missing reset token. Use the link from your email.'); return; }
    setBusy(true);
    try {
      await authApi.resetPassword({ token, password });
      nav('/login', { replace: true });
    } catch (ex) {
      setErr(errorText(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="forgot-page">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">Bookstore</Link>
        </div>
      </header>
      <main className="container forgot-box">
        <h1>Set a new password</h1>
        <div className="panel pad">
          <form onSubmit={submit}>
            <label className="fld">
              <span>New password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="fld">
              <span>Confirm password</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {err && <p className="form-err">{err}</p>}
            <button className="btn-red" disabled={busy} type="submit">
              {busy ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </div>
        <Link className="create-acc" to="/login">Back to login</Link>
      </main>
    </div>
  );
}