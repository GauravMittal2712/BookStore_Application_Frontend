import { useState } from 'react';
import { ordersApi } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { dateOnly, dateTime, errorText, money } from '../../utils/format.js';
import { OrderBadge, PayBadge } from './ui/Badge.jsx';
import DataTable from './ui/DataTable.jsx';
import Modal, { ConfirmModal } from './ui/Modal.jsx';
import PageHeader from './ui/PageHeader.jsx';
import usePagedList from './ui/usePagedList.js';
import { IconEye } from './ui/icons.jsx';

const TABS = [[undefined, 'All'], ['pending', 'Pending'], ['processing', 'Processing'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']];
// mirrors the backend transition rules (order.rules.js)
const NEXT = { pending: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };

function OrderDetail({ order, onClose }) {
  const addr = order.shippingAddress || {};
  return (
    <Modal title={`Order #${order.id.slice(-8)}`} size="lg" onClose={onClose} footer={<button type="button" className="ad-btn ghost" onClick={onClose}>Close</button>}>
      <div className="ad-kv">
        <div><span>Customer</span>{order.customer?.name || '—'}<div className="ad-cell-sub">{order.customer?.email}</div></div>
        <div><span>Placed</span>{dateTime(order.createdAt)}</div>
        <div><span>Status</span><OrderBadge status={order.status} /></div>
        <div><span>Payment</span>{order.paymentMethod === 'online' ? 'Online' : 'Cash on delivery'} · <PayBadge status={order.paymentStatus} /></div>
      </div>

      <div className="ad-sub-h" style={{ marginTop: 0 }}>Items</div>
      <table className="ad-mini">
        <thead><tr><th>Book</th><th className="r">Qty</th><th className="r">Price</th><th className="r">Subtotal</th></tr></thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={idx}><td>{i.title}</td><td className="r">{i.quantity}</td><td className="r">{money(i.price)}</td><td className="r">{money(i.price * i.quantity)}</td></tr>
          ))}
        </tbody>
        <tfoot><tr><td colSpan={3} className="r">Total</td><td className="r">{money(order.totalAmount)}</td></tr></tfoot>
      </table>

      <div className="ad-sub-h">Shipping address</div>
      <div>{[addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ') || '—'}</div>

      <div className="ad-sub-h">History</div>
      <ul className="ad-timeline">
        {order.statusHistory.map((h, i) => (
          <li key={i}><OrderBadge status={h.status} /><time>{dateTime(h.at)}</time></li>
        ))}
      </ul>
    </Modal>
  );
}

export default function AdminOrders() {
  const toast = useToast();
  const list = usePagedList((p) => ordersApi.list(p));
  const [viewing, setViewing] = useState(null);
  const [pending, setPending] = useState(null); // { order, to } awaiting cancel confirmation
  const [busyId, setBusyId] = useState(null);

  const apply = async (order, to) => {
    setBusyId(order.id);
    try {
      await ordersApi.changeStatus(order.id, to);
      toast(`Order #${order.id.slice(-8)} marked ${to}`);
      setPending(null);
      list.reload();
    } catch (ex) {
      toast(errorText(ex), 'error');
    } finally {
      setBusyId(null);
    }
  };
  const requestChange = (order, to) => {
    if (!to) return;
    if (to === 'cancelled') setPending({ order, to });
    else apply(order, to);
  };

  const columns = [
    { key: 'id', header: 'Order', render: (o) => <><span className="ad-mono ad-cell-main">#{o.id.slice(-8)}</span><div className="ad-cell-sub">{dateOnly(o.createdAt)}</div></> },
    { key: 'cust', header: 'Customer', render: (o) => <><div className="ad-cell-main">{o.customer?.name || '—'}</div><div className="ad-cell-sub">{o.customer?.email}</div></> },
    { key: 'items', header: 'Items', align: 'right', render: (o) => <span className="ad-num">{o.items.reduce((n, i) => n + i.quantity, 0)}</span> },
    { key: 'total', header: 'Total', render: (o) => <span className="ad-num ad-cell-main">{money(o.totalAmount)}</span> },
    { key: 'pay', header: 'Payment', render: (o) => <><div style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 600 }}>{o.paymentMethod}</div><PayBadge status={o.paymentStatus} /></> },
    { key: 'status', header: 'Status', render: (o) => <OrderBadge status={o.status} /> },
    {
      key: 'update',
      header: 'Update status',
      render: (o) => (NEXT[o.status].length ? (
        <select
          className="ad-status-select"
          aria-label={`Change status of order ${o.id.slice(-8)}`}
          value=""
          disabled={busyId === o.id}
          onChange={(e) => requestChange(o, e.target.value)}
        >
          <option value="">Move to…</option>
          {NEXT[o.status].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : <span className="ad-cell-sub">Final</span>),
    },
    {
      key: 'view',
      header: '',
      width: 56,
      render: (o) => <div className="ad-actions"><button type="button" className="ad-icon-btn" onClick={() => setViewing(o)} aria-label="View order" title="View details"><IconEye /></button></div>,
    },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Review orders and move them through fulfilment." />
      <div className="ad-toolbar">
        <div className="ad-seg" role="group" aria-label="Order status filter">
          {TABS.map(([v, label]) => (
            <button key={label} type="button" className={list.params.status === v ? 'on' : ''} onClick={() => list.setFilter({ status: v })}>{label}</button>
          ))}
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        emptyTitle="No orders found"
        emptyHint={list.params.status ? `There are no ${list.params.status} orders.` : 'Orders will appear here once customers check out.'}
        pagination={{ ...list.meta, page: list.params.page, limit: list.params.limit, onPage: list.setPage, onLimit: list.setLimit }}
      />
      {viewing && <OrderDetail order={viewing} onClose={() => setViewing(null)} />}
      {pending && (
        <ConfirmModal
          title="Cancel this order?"
          message="The books go back into stock and any online payment is refunded. This cannot be undone."
          confirmLabel="Cancel order"
          danger
          busy={busyId === pending.order.id}
          onConfirm={() => apply(pending.order, 'cancelled')}
          onClose={() => busyId === null && setPending(null)}
        />
      )}
    </>
  );
}