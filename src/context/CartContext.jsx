import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../api/index.js';
import { useAuth } from './AuthContext.jsx';

const EMPTY = { items: [], totalItems: 0, subtotal: 0 };
const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const isCustomer = user?.role === 'customer';

  const refresh = useCallback(async () => {
    if (!isCustomer) { setCart(EMPTY); setLoaded(true); return EMPTY; }
    try {
      const { data } = await cartApi.get();
      setCart(data);
      return data;
    } catch {
      return null;
    } finally {
      setLoaded(true);
    }
  }, [isCustomer]);

  useEffect(() => {
    setLoaded(false);
    refresh();
  }, [refresh, user?.id]);

  const run = useCallback(async (fn) => {
    const { data } = await fn();
    setCart(data);
    return data;
  }, []);

  const value = useMemo(() => ({
    cart, loaded, count: cart.totalItems || 0, refresh,
    add: (bookId, qty = 1) => run(() => cartApi.add(bookId, qty)),
    setQty: (itemId, qty) => run(() => cartApi.setQty(itemId, qty)),
    remove: (itemId) => run(() => cartApi.remove(itemId)),
  }), [cart, loaded, refresh, run]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
