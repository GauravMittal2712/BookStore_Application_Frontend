import { useEffect, useId, useRef } from 'react';
import { IconClose } from './icons.jsx';

export default function Modal({ title, onClose, children, footer, size = 'md', busy = false }) {
  const titleId = useId();
  const box = useRef(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (e) => { if (e.key === 'Escape' && !busyRef.current) closeRef.current(); };
    document.addEventListener('keydown', key);
    box.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', key);
    };
  }, []);

  return (
    <div className="ad-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className={`ad-modal ${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={box}>
        <div className="ad-modal-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="ad-icon-btn" onClick={onClose} disabled={busy} aria-label="Close"><IconClose /></button>
        </div>
        <div className="ad-modal-body">{children}</div>
        {footer && <div className="ad-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      size="sm"
      busy={busy}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="ad-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className={`ad-btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      )}
    >
      <p className="ad-confirm-text">{message}</p>
    </Modal>
  );
}