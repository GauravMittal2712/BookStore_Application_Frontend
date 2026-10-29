import { useCallback, useEffect, useRef, useState } from 'react';
import { errorText } from '../../../utils/format.js';

const EMPTY_META = { page: 1, limit: 10, total: 0, totalPages: 1 };

// Server-side pagination state for an admin table.
//  fetcher(params) -> API response ({ data, meta }). Params: page, limit + any filters you set.
//  Stale responses are ignored, so quick typing / page clicks can't show out-of-order data.
export default function usePagedList(fetcher, { limit = 10, filters = {} } = {}) {
  const [params, setParams] = useState({ page: 1, limit, ...filters });
  const [state, setState] = useState({ items: [], meta: EMPTY_META, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const reqId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const id = ++reqId.current;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcherRef.current(params)
      .then((r) => {
        if (id !== reqId.current) return;
        const items = Array.isArray(r.data) ? r.data : (r.data?.items || []);
        setState({
          items,
          meta: r.meta || { ...EMPTY_META, limit: params.limit, total: items.length },
          loading: false,
          error: '',
        });
      })
      .catch((e) => {
        if (id !== reqId.current) return;
        setState((s) => ({ ...s, loading: false, error: errorText(e) }));
      });
  }, [params, tick]);

  // e.g. last row on the last page was deleted -> step back to the new last page
  useEffect(() => {
    if (!state.loading && !state.error && params.page > state.meta.totalPages) {
      setParams((p) => ({ ...p, page: state.meta.totalPages }));
    }
  }, [state.loading, state.error, state.meta.totalPages, params.page]);

  const setPage = useCallback((page) => setParams((p) => ({ ...p, page })), []);
  const setLimit = useCallback((l) => setParams((p) => ({ ...p, limit: l, page: 1 })), []);
  const setFilter = useCallback((patch) => setParams((p) => ({ ...p, ...patch, page: 1 })), []);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const patchItem = useCallback((match, patch) => {
    setState((s) => ({ ...s, items: s.items.map((i) => (match(i) ? { ...i, ...patch } : i)) }));
  }, []);

  return { ...state, params, setPage, setLimit, setFilter, reload, patchItem };
}