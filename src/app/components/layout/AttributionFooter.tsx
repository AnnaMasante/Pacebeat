export function AttributionFooter() {
  return (
    <footer className="flex justify-center py-lg text-xs text-ink-low">
      <p>
        Données de tempo par{" "}
        <a
          href="https://getsongbpm.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-ink-medium"
        >
          GetSongBPM
        </a>
      </p>
    </footer>
  );
}
