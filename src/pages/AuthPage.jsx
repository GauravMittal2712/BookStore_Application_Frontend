import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { EyeIcon } from '../components/Icons.jsx';
import { MOBILE_RE, errorText, passwordError } from '../utils/format.js';

function Field({ label, error, children }) {
  return (
    <label className={`afield${error ? ' bad' : ''}`}>
      <span className="alabel">{label}</span>
      {children}
      {error && <em className="ferr">{error}</em>}
    </label>
  );
}

export default function AuthPage({ mode }) {
  const signup = mode === 'signup';
  const { user, ready, login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || '/';
  const [f, setF] = useState({ name: '', email: '', password: '', mobile: '' });
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (ready && user) return <Navigate to={from} replace />;
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErrs({ ...errs, [k]: '' }); };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (signup && !f.name.trim()) er.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Enter a valid email id';
    if (signup) {
      const pe = passwordError(f.password);
      if (pe) er.password = pe;
      if (!MOBILE_RE.test(f.mobile.trim())) er.mobile = 'Enter a valid mobile number';
    } else if (!f.password) er.password = 'Enter your password';
    setErrs(er);
    setServerErr('');
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      if (signup) await register({ name: f.name.trim(), email: f.email.trim(), password: f.password, mobile: f.mobile.trim() });
      else await login(f.email.trim(), f.password);
      nav(from, { replace: true });
    } catch (ex) {
      setServerErr(errorText(ex));
    } finally { setBusy(false); }
  };

  const tabState = { state: loc.state };
  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-left">
          <img src="/login-illustration.png" alt="" width="258" height="258" />
          <p>ONLINE BOOK SHOPPING</p>
        </div>
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <Link role="tab" aria-selected={!signup} className={!signup ? 'on' : ''} to="/login" {...tabState}>LOGIN</Link>
            <Link role="tab" aria-selected={signup} className={signup ? 'on' : ''} to="/signup" {...tabState}>SIGNUP</Link>
          </div>
          <form onSubmit={submit} noValidate>
            {signup && (
              <Field label="Full Name" error={errs.name}>
                <input autoComplete="name" value={f.name} onChange={set('name')} maxLength={100} />
              </Field>
            )}
            <Field label="Email Id" error={errs.email}>
              <input type="email" autoComplete="email" value={f.email} onChange={set('email')} />
            </Field>
            <Field label="Password" error={errs.password}>
              <span className="pw">
                <input type={show ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} value={f.password} onChange={set('password')} maxLength={72} />
                <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}><EyeIcon off={!show} /></button>
              </span>
            </Field>
            {signup ? (
              <Field label="Mobile Number" error={errs.mobile}>
                <input type="tel" autoComplete="tel" value={f.mobile} onChange={set('mobile')} maxLength={20} />
              </Field>
            ) : (
              <div className="forgot"><Link to="/forgot-password">Forgot Password?</Link></div>
            )}
            {serverErr && <p className="form-err" role="alert">{serverErr}</p>}
            <button className="btn-red" type="submit" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Signup' : 'Login'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
