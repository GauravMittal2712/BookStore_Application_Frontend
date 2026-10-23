import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const timer = useRef();
  const toast = useCallback((message, kind = 'info') => {
    clearTimeout(timer.current);
    setT({ message, kind, id: Date.now() });
    timer.current = setTimeout(() => setT(null), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {t && (
        <div className={`toast toast-${t.kind}`} role="status" aria-live="polite" key={t.id}>
          {t.message}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
