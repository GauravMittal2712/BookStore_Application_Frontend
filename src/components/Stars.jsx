import { useState } from 'react';
import { StarIcon } from './Icons.jsx';

export function Stars({ value = 0, size = 14 }) {
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} filled={n <= value} size={size} />)}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="stars stars-input" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Overall rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}
        >
          <StarIcon filled={n <= (hover || value)} size={22} />
        </button>
      ))}
    </span>
  );
}
