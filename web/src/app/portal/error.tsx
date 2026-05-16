"use client";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
        Er ging iets mis
      </h2>
      <p className="text-[13px] text-[var(--text-secondary)] max-w-xs">
        De pagina kon niet geladen worden. Probeer het opnieuw of neem contact op als dit blijft gebeuren.
      </p>
      <button
        onClick={reset}
        className="px-4 h-9 rounded-lg bg-[var(--accent-500)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}
