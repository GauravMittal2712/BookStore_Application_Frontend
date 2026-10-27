import { Link, Navigate, useLocation } from 'react-router-dom';
import { Confetti } from '../components/Icons.jsx';
import { STORE } from '../config.js';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  if (!state?.order) return <Navigate to="/orders" replace />;
  const { order } = state;
  return (
    <div className="success">
      <Confetti />
      <h1>Order Placed Successfully</h1>
      <Confetti small />
      <p className="success-msg">
        hurray!! your order is confirmed{order.paymentStatus === 'paid' ? ' and paid' : ''}<br />
        the order id is <b>#{order.id}</b> save the order id for<br />
        further communication..
      </p>
      <table className="success-table">
        <thead><tr><th>Email us</th><th>Contact us</th><th>Address</th></tr></thead>
        <tbody><tr><td>{STORE.email}</td><td>{STORE.phone}</td><td>{STORE.address}</td></tr></tbody>
      </table>
      <Link className="btn-blue wide" to="/">CONTINUE SHOPPING</Link>
    </div>
  );
}