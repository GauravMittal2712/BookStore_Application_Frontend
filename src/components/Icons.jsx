const base = { xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true, focusable: false };

export const LogoBook = (p) => (
  <svg {...base} viewBox="0 0 28 22" width="28" height="22" {...p}>
    <path fill="#fff" d="M.6 3.4C4.800 1.600 9.300 2.100 13 4.700v15.800C9.300 18.100 4.800 17.800.6 19.300z" />
    <path fill="#fff" d="M27.400 3.400C23.200 1.600 18.700 2.100 15 4.700v15.800c3.700-2.400 8.200-2.700 12.400-1.200z" />
    <path fill="#a03037" d="M2.800 6.200c2.800-.8 5.500-.4 8 .9v1.300c-2.500-1.200-5.200-1.600-8-.8zM2.800 10.200c2.800-.8 5.500-.4 8 .9v1.300c-2.500-1.200-5.200-1.600-8-.8zM25.200 6.200c-2.800-.8-5.500-.4-8 .9v1.300c2.500-1.200 5.200-1.600 8-.8zM25.200 10.200c-2.800-.8-5.500-.4-8 .9v1.300c2.500-1.200 5.200-1.600 8-.8z" />
  </svg>
);
export const SearchIcon = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" {...p}>
    <circle cx="10" cy="10" r="6.500" /><path d="M15 15l6 6" />
  </svg>
);
export const PersonIcon = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="7.500" r="3.800" /><path d="M4.500 20c0-4 3.300-5.800 7.500-5.800s7.500 1.800 7.500 5.800z" />
  </svg>
);
export const CartIcon = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="1.900" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M2 3h3l2.600 12.200h10.800L21 7H6.200" /><circle cx="9.500" cy="19.500" r="1.500" /><circle cx="17" cy="19.500" r="1.500" />
  </svg>
);
export const PinIcon = (p) => (
  <svg {...base} viewBox="0 0 24 30" width="18" height="22" {...p}>
    <ellipse cx="12" cy="27.500" rx="5" ry="1.600" fill="#d9d9d9" />
    <path fill="#a03037" d="M12 1C6.400 1 2.200 5.200 2.200 10.600 2.200 17.500 12 26.500 12 26.500s9.800-9 9.800-15.900C21.800 5.200 17.600 1 12 1z" />
    <circle cx="12" cy="10.500" r="3.600" fill="#fff" />
  </svg>
);
export const ChevronDown = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const ArrowLeft = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 5l-7 7 7 7" /></svg>
);
export const ArrowRight = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 5l7 7-7 7" /></svg>
);
export const EyeIcon = ({ off, ...p }) => (
  <svg {...base} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M1.500 12S5.500 5 12 5s10.500 7 10.500 7-4 7-10.500 7S1.500 12 1.500 12z" /><circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
export const TrashIcon = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </svg>
);
export const HeartIcon = (p) => (
  <svg {...base} viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}>
    <path d="M12 21.300l-1.500-1.300C5.200 15.200 2 12.300 2 8.700 2 5.800 4.300 3.500 7.200 3.500c1.700 0 3.300.8 4.800 2.400 1.500-1.600 3.100-2.400 4.800-2.400 2.900 0 5.200 2.300 5.200 5.200 0 3.600-3.200 6.500-8.500 11.300z" />
  </svg>
);
export const StarIcon = ({ filled, size = 14, ...p }) => (
  <svg {...base} viewBox="0 0 24 24" width={size} height={size} {...p}>
    <path
      d="M12 2.800l2.800 5.900 6.400.8-4.700 4.400 1.200 6.400L12 17.200l-5.700 3.100 1.200-6.400L2.800 9.500l6.400-.8z"
      fill={filled ? '#ffce00' : 'none'} stroke={filled ? '#ffce00' : '#8a8a8a'} strokeWidth="1.500" strokeLinejoin="round"
    />
  </svg>
);
export const HeartDoc = (p) => (
  <svg {...base} viewBox="0 0 70 76" width="70" height="76" {...p}>
    <path d="M22 4h32l8 8v52H22z" fill="#fff" stroke="#555" strokeWidth="1.500" strokeLinejoin="round" />
    <path d="M30 14h20M30 20h24M30 26h18M30 32h22" stroke="#777" strokeWidth="1.500" strokeLinecap="round" />
    <path d="M14 46c0-4.500 3.300-8 7.500-8 3 0 5.200 1.600 6.500 4 1.300-2.400 3.500-4 6.500-4 4.200 0 7.500 3.500 7.500 8 0 8-14 17-14 17S14 54 14 46z" fill="#f2545b" />
  </svg>
);
export const Confetti = ({ small, ...p }) => small ? (
  <svg {...base} viewBox="0 0 110 50" width="110" height="50" {...p}>
    <g strokeLinecap="round" strokeWidth="3">
      <path d="M44 42V12" stroke="#4a70c8" /><path d="M54 42C54 28 60 18 70 14" stroke="#e8462f" fill="none" /><path d="M38 40C40 28 34 22 28 20" stroke="#f5a623" fill="none" />
    </g>
    <circle cx="20" cy="30" r="2.500" fill="#33b469" /><circle cx="84" cy="38" r="3" fill="#2f4fb8" /><circle cx="76" cy="10" r="2" fill="#f5a623" /><circle cx="12" cy="14" r="2" fill="#e8462f" />
  </svg>
) : (
  <svg {...base} viewBox="0 0 190 120" width="190" height="120" {...p}>
    <g strokeLinecap="round" strokeWidth="4">
      <path d="M52 14l14 28" stroke="#4a70c8" /><path d="M140 8l-14 26" stroke="#33b469" /><path d="M32 52l14 14" stroke="#e8462f" /><path d="M160 44l-16 14" stroke="#f5a623" />
    </g>
    <path d="M95 36l6.500 13.200 14.500 2.100-10.500 10.200 2.500 14.500L95 69.200l-13 6.800 2.500-14.500L74 51.300l14.500-2.100z" fill="#fbc02d" />
    <path d="M46 78l5.500 11 12 1.800-8.700 8.500 2 12L46 105l-10.800 5.700 2-12-8.700-8.500 12-1.800z" fill="#fbc02d" transform="scale(.7) translate(26 38)" />
    <path d="M150 78l5.500 11 12 1.800-8.700 8.500 2 12L150 105l-10.800 5.700 2-12-8.700-8.500 12-1.800z" fill="#fbc02d" transform="scale(.7) translate(66 38)" />
    <circle cx="20" cy="86" r="3" fill="#2f4fb8" /><circle cx="176" cy="76" r="2.500" fill="#33b469" /><circle cx="110" cy="14" r="3" fill="#e8462f" /><circle cx="70" cy="10" r="2.500" fill="#e8462f" />
  </svg>
);
