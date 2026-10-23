import { Link } from 'react-router-dom';

export default function Breadcrumb({ current }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link><span className="sep">/</span><b>{current}</b>
    </nav>
  );
}
