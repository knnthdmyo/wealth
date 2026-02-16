"use client";

type HeaderProps = {
  title: string;
  onMenuClick?: () => void;
};

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-canvas-light/80 backdrop-blur dark:bg-canvas-dark/80">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Wealth</p>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </header>
  );
}
