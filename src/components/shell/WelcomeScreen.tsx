// ─────────────────────────────────────────
// WELCOME SCREEN — MVP11 W30
// First-run gate. Shown only when no user data exists in localStorage.
// Intentionally thin — will be polished in MVP12.
// ─────────────────────────────────────────

interface WelcomeScreenProps {
  onBegin: () => void;
}

export function WelcomeScreen({ onBegin }: WelcomeScreenProps) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-gray-900 px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="text-7xl" role="img" aria-label="frog">🐸</span>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            CAN-DO-BE
          </h1>
          <p className="text-base text-gray-400">
            Your life. Your quest.
          </p>
        </div>

        <button
          type="button"
          onClick={onBegin}
          className="mt-4 w-full max-w-xs rounded-xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow-lg active:bg-emerald-600"
        >
          Begin
        </button>
      </div>
    </div>
  );
}
