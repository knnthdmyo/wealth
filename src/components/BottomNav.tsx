"use client";

type BottomNavProps = {
  onLogout: () => void;
};

export default function BottomNav({ onLogout }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-canvas-light/90 backdrop-blur dark:bg-canvas-dark/90">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-6 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Overview</p>
          <p className="text-sm font-semibold">Dashboard</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
