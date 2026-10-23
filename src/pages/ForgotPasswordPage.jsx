import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMsg('Enter a valid email id.');
    // The backend has no password-reset endpoint yet, so we say so instead of pretending to send mail.
    setMsg('Password reset by email is not available yet. Please contact support to reset your password.');
  };
  return (
    <div className="shell">
      <Header bare />
      <main className="main forgot-main">
        <h1 className="forgot-title">Forgot Your Password?</h1>
        <div className="forgot-card">
          <form onSubmit={submit} noValidate className="forgot-top">
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <label className="afield"><span className="alabel">Email Id</span>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setMsg(''); }} />
            </label>
            {msg && <p className="form-err" role="status">{msg}</p>}
            <button className="btn-red" type="submit">Reset Password</button>
          </form>
          <Link to="/signup" className="forgot-create">CREATE ACCOUNT</Link>
        </div>
      </main>
    </div>
  );
}
