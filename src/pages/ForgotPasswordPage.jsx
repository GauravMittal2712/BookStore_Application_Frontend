import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/index.js';
import { errorText } from '../utils/format.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErr('Enter a valid email id');
      return;
    }
    setBusy(true);
    try {
      const r = await authApi.forgotPassword(email.trim());
      setMsg(r.data?.message || 'If that email exists, a reset link has been sent.');
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
        <h1>Forgot Your Password?</h1>
        <div className="panel pad">
          <p className="muted">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          <form onSubmit={submit}>
            <label className="fld">
              <span>Email Id</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {err && <p className="form-err">{err}</p>}
            {msg && <p className="form-ok">{msg}</p>}
            <button className="btn-red" disabled={busy} type="submit">
              {busy ? 'Sending…' : 'Reset Password'}
            </button>
          </form>
        </div>
        <Link className="create-acc" to="/signup">CREATE ACCOUNT</Link>
      </main>
    </div>
  );
}