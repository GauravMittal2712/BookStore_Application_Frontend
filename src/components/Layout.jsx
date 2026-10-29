import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { isStaff } from '../utils/format.js';

// The storefront is for guests and customers only. Admins and helpers are sent to their own console.
export default function Layout() {
  const { pathname } = useLocation();
  const { user, ready } = useAuth();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (!ready) return <div className="page-loading">Loading…</div>;
  if (isStaff(user)) return <Navigate to="/admin" replace />;
  return (
    <div className="shell">
      <Header />
      <main className="main"><Outlet /></main>
      <Footer />
    </div>
  );
}