"use client";

import { useTheme } from "next-themes";

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export default function Menu({ isOpen, onClose, onLogout }: MenuProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-canvas-light dark:bg-canvas-dark">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quick settings</p>
                <p className="text-lg font-semibold">Preferences</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Theme</p>
              <div className="grid gap-2">
                <button
                  onClick={() => {
                    setTheme("light");
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                    theme === "light"
                      ? "bg-teal-500 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 0 018 0z"
                    />
                  </svg>
                  Light
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                    theme === "dark"
                      ? "bg-teal-500 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  Dark
                </button>
                <button
                  onClick={() => {
                    setTheme("system");
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                    theme === "system"
                      ? "bg-teal-500 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  System
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
