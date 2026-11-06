export function Wordmark() {
  return (
    <div className="wordmark">
      byte<span>.</span>
    </div>
  );
}

export function Splash() {
  return (
    <div className="splash" aria-label="Loading">
      <Wordmark />
    </div>
  );
}
