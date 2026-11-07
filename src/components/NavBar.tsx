// iOS-style top bar: small centered title, optional buttons on each side.
type Props = {
  title: string;
  subtitle?: string;
  onTitle?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function NavBar({ title, subtitle, onTitle, left, right }: Props) {
  const label = (
    <>
      <strong>{title}</strong>
      {subtitle && <small>{subtitle}</small>}
    </>
  );
  return (
    <header className="navbar">
      <div className="nav-side">{left}</div>
      {onTitle ? (
        <button className="nav-title" onClick={onTitle}>
          {label}
        </button>
      ) : (
        <h1 className="nav-title">{label}</h1>
      )}
      <div className="nav-side nav-right">{right}</div>
    </header>
  );
}
