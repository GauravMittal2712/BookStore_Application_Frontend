export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="ad-pagehead">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="ad-pagehead-actions">{actions}</div>}
    </div>
  );
}