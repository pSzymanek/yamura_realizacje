export function CustomerPageHeading({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="customer-page-heading">
      <div>
        <span className="customer-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {aside && <div className="customer-page-heading__aside">{aside}</div>}
    </header>
  );
}
