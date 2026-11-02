"use client";

export function AudioToggle({ enabled, onToggle, className = "" }: { enabled: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute music and sounds" : "Enable music and sounds"}
      title={enabled ? "Mute" : "Enable music"}
      onClick={onToggle}
    >
      {enabled ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor" stroke="none" />
          <path d="m22 9-6 6M16 9l6 6" />
        </svg>
      )}
    </button>
  );
}
