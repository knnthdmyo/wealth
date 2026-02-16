"use client";

type BottomNavProps = {
  activeTab: "overview" | "accounts";
  onTabChange: (tab: "overview" | "accounts") => void;
  onMenuClick: () => void;
};

export default function BottomNav({ activeTab, onTabChange, onMenuClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-canvas-light/90 backdrop-blur dark:border-slate-800 dark:bg-canvas-dark/90">
      <div className="flex w-full max-w-[480px] items-center justify-between ">
        <button
          type="button"
          onClick={() => onTabChange("overview")}
          className={`group flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
            activeTab === "overview"
              ? "text-teal-600 dark:text-teal-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          aria-pressed={activeTab === "overview"}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              activeTab === "overview"
                ? "bg-teal-500/10"
                : "bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l9-9 9 9M4.5 10.5V21h5.25v-5.25h4.5V21H19.5V10.5"
              />
            </svg>
          </div>
          Overview
        </button>

        <button
          type="button"
          onClick={() => onTabChange("accounts")}
          className={`group flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
            activeTab === "accounts"
              ? "text-teal-600 dark:text-teal-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          aria-pressed={activeTab === "accounts"}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              activeTab === "accounts"
                ? "bg-teal-500/10"
                : "bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12H17a2 2 0 0 1 0-4h4"
              />
            </svg>
          </div>
          Accounts
        </button>

        <button
          type="button"
          onClick={onMenuClick}
          className="group flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          Menu
        </button>
      </div>
    </nav>
  );
}
