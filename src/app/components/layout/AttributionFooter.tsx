export function AttributionFooter() {
  return (
    <footer className="flex justify-center py-lg text-xs text-ink-low">
      <p>
        {/* Wording is a placeholder — verify against Deezer's actual API attribution/branding requirements before shipping publicly. */}
        Données de tempo par{" "}
        <a
          href="https://www.deezer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-ink-medium"
        >
          Deezer
        </a>
      </p>
    </footer>
  );
}
