import { useState } from 'react';

const PALETTE = ['#7a1f24', '#2f3e5c', '#1f5f5b', '#3b3b3b', '#8a5a14', '#4a2c6d', '#245a2f', '#a03037'];

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function wrap(title, max = 11, maxLines = 5) {
  const lines = [];
  let cur = '';
  for (const w of title.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, '…'); }
  return lines;
}

export default function BookCover({ book, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (book.coverImageUrl && !failed) {
    return <img className={`cover ${className}`} src={book.coverImageUrl} alt={`${book.title} cover`} onError={() => setFailed(true)} />;
  }
  const lines = wrap(book.title || '');
  const bg = PALETTE[hash(book.title || '') % PALETTE.length];
  const fs = lines.length > 3 ? 11.5 : 13.5;
  const startY = 74 - ((lines.length - 1) * (fs + 3)) / 2;
  const author = (book.author || '').length > 24 ? `${book.author.slice(0, 23)}…` : book.author;
  return (
    <svg className={`cover cover-gen ${className}`} viewBox="0 0 120 168" role="img" aria-label={`${book.title} by ${book.author}`}>
      <rect width="120" height="168" fill={bg} />
      <rect x="6" y="6" width="108" height="156" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".8" />
      <rect x="0" y="0" width="7" height="168" fill="rgba(0,0,0,.18)" />
      {lines.map((l, i) => (
        <text key={i} x="63" y={startY + i * (fs + 3)} textAnchor="middle" fontFamily="Roboto, Arial, sans-serif" fontWeight="700" fontSize={fs} fill="#fff">{l}</text>
      ))}
      <line x1="38" x2="88" y1="132" y2="132" stroke="rgba(255,255,255,.5)" strokeWidth=".8" />
      <text x="63" y="147" textAnchor="middle" fontFamily="Roboto, Arial, sans-serif" fontSize="7.500" fill="rgba(255,255,255,.88)">{author}</text>
    </svg>
  );
}
