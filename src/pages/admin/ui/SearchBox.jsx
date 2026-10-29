import { useEffect, useRef, useState } from 'react';
import { IconClose, IconSearch } from './icons.jsx';

// Debounced search input: calls onChange(trimmedValue) 350ms after the user stops typing.
export default function SearchBox({ onChange, placeholder = 'Search…', label = 'Search' }) {
  const [v, setV] = useState('');
  const first = useRef(true);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    const t = setTimeout(() => cb.current(v.trim()), 350);
    return () => clearTimeout(t);
  }, [v]);

  return (
    <label className="ad-search">
      <IconSearch size={16} />
      <input type="search" value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} aria-label={label} />
      {v && (
        <button type="button" className="ad-search-x" onClick={() => setV('')} aria-label="Clear search">
          <IconClose size={14} />
        </button>
      )}
    </label>
  );
}