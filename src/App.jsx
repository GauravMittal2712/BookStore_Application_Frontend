import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import BooksPage from './pages/BooksPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminLayout, { RequireRole, RequireStaff } from './pages/admin/AdminLayout.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';
import AdminBooks from './pages/admin/AdminBooks.jsx';
import AdminInventory from './pages/admin/AdminInventory.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminAccount from './pages/admin/AdminAccount.jsx';

export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
        <Route index element={<AdminHome />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<RequireRole roles={['admin']}><AdminOrders /></RequireRole>} />
        <Route path="users" element={<RequireRole roles={['admin']}><AdminUsers /></RequireRole>} />
        <Route path="account" element={<AdminAccount />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="/order-success" element={<RequireAuth><OrderSuccessPage /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}