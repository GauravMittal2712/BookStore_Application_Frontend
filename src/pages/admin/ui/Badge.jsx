export const LOW_STOCK = 5;

export function Badge({ tone = 'neutral', children }) {
  return <span className={`ad-badge ${tone}`}>{children}</span>;
}

const ORDER_TONE = { pending: 'warn', processing: 'info', shipped: 'violet', delivered: 'ok', cancelled: 'danger' };
export const OrderBadge = ({ status }) => <Badge tone={ORDER_TONE[status] || 'neutral'}>{status}</Badge>;

const PAY_TONE = { paid: 'ok', unpaid: 'warn', failed: 'danger', refunded: 'info', refund_failed: 'danger' };
export const PayBadge = ({ status }) => <Badge tone={PAY_TONE[status] || 'neutral'}>{String(status || 'unpaid').replace('_', ' ')}</Badge>;

const ROLE_TONE = { admin: 'violet', helper: 'teal', customer: 'neutral' };
export const RoleBadge = ({ role }) => <Badge tone={ROLE_TONE[role] || 'neutral'}>{role}</Badge>;

export function StockBadge({ stock }) {
  if (stock <= 0) return <Badge tone="danger">Out of stock</Badge>;
  if (stock <= LOW_STOCK) return <Badge tone="warn">Low · {stock}</Badge>;
  return <Badge tone="ok">{stock} in stock</Badge>;
}