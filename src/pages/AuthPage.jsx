import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { EyeIcon } from '../components/Icons.jsx';
import { MOBILE_RE, errorText, passwordError } from '../utils/format.js';
import { GOOGLE_CLIENT_ID } from '../config.js';

function Field({ label, error, children }) {
  return (
    <label className={`afield${error ? ' bad' : ''}`}>
      <span className="alabel">{label}</span>
      {children}
      {error && <em className="ferr">{error}</em>}
    </label>
  );
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.getElementById('google-gsi');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const s = document.createElement('script');
    s.id = 'google-gsi';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Google's script must be initialised only once per page load; the callback always calls the latest handler.
let gsiInitialized = false;
const googleHandler = { current: null };

export default function AuthPage({ mode }) {
  const signup = mode === 'signup';
  const { user, ready, login, register, loginWithGoogle } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || '/';
  const [f, setF] = useState({ name: '', email: '', password: '', mobile: '' });
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);
  const googleBtnRef = useRef(null);

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    setErrs({ ...errs, [k]: '' });
  };

  googleHandler.current = async (resp) => {
    setServerErr('');
    setBusy(true);
    try {
      await loginWithGoogle(resp.credential);
      nav(from, { replace: true });
    } catch (ex) {
      setServerErr(errorText(ex));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts?.id) return;
        if (!gsiInitialized) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (resp) => googleHandler.current?.(resp),
          });
          gsiInitialized = true;
        }
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 280,
          text: signup ? 'signup_with' : 'signin_with',
        });
      } catch {
        /* script blocked */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signup]);

  if (ready && user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (signup && !f.name.trim()) er.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Enter a valid email id';
    if (signup) {
      const pe = passwordError(f.password);
      if (pe) er.password = pe;
      if (f.mobile && !MOBILE_RE.test(f.mobile.trim())) er.mobile = 'Enter a valid mobile number';
    } else if (!f.password) er.password = 'Enter your password';
    setErrs(er);
    setServerErr('');
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      if (signup) {
        await register({
          name: f.name.trim(),
          email: f.email.trim(),
          password: f.password,
          mobile: f.mobile.trim() || undefined,
        });
      } else await login(f.email.trim(), f.password);
      nav(from, { replace: true });
    } catch (ex) {
      setServerErr(errorText(ex));
    } finally {
      setBusy(false);
    }
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
            <Link role="tab" aria-selected={!signup} to="/login" {...tabState}>LOGIN</Link>
            <Link role="tab" aria-selected={signup} to="/signup" {...tabState}>SIGNUP</Link>
          </div>
          <form onSubmit={submit} noValidate>
            {signup && (
              <Field label="Full Name" error={errs.name}>
                <input value={f.name} onChange={set('name')} autoComplete="name" />
              </Field>
            )}
            <Field label="Email Id" error={errs.email}>
              <input type="email" value={f.email} onChange={set('email')} autoComplete="email" />
            </Field>
            <Field label="Password" error={errs.password}>
              <div className="pwd">
                <input
                  type={show ? 'text' : 'password'}
                  value={f.password}
                  onChange={set('password')}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                />
                <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
                  <EyeIcon />
                </button>
              </div>
            </Field>
            {signup && (
              <Field label="Mobile Number" error={errs.mobile}>
                <input type="tel" value={f.mobile} onChange={set('mobile')} autoComplete="tel" />
              </Field>
            )}
            {!signup && (
              <div className="auth-forgot">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            )}
            {serverErr && <p className="form-err">{serverErr}</p>}
            <button className="btn-red wide" disabled={busy} type="submit">
              {busy ? 'Please wait…' : signup ? 'Signup' : 'Login'}
            </button>
          </form>
          {GOOGLE_CLIENT_ID && (
            <>
              <div className="auth-or"><span>OR</span></div>
              <div className="auth-social">
                <div ref={googleBtnRef} className="google-btn-host" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}