"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFxRate } from "@/lib/fx";
import type { Account } from "@/types/db";

type AccountCardProps = {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onViewHistory: (account: Account) => void;
};

export default function AccountCard({ account, onEdit, onDelete, onViewHistory }: AccountCardProps) {
  const { data: fxData } = useQuery({
    queryKey: ["fxRate", account.currency],
    queryFn: () => fetchFxRate(account.currency),
    staleTime: 12 * 60 * 60 * 1000,
    enabled: account.currency.toUpperCase() !== "PHP",
  });

  const rate = account.currency.toUpperCase() === "PHP" ? 1 : (fxData?.rate ?? 1);
  const phpValue = account.balance * rate;
  const isNonPHP = account.currency.toUpperCase() !== "PHP";

  return (
    <div className="card space-y-3 hover:shadow-lg cursor-pointer" onClick={() => onViewHistory(account)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{account.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {account.provider} • {account.category.replace("_", " ")}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            account.is_liability
              ? "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-200"
              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200"
          }`}
        >
          {account.is_liability ? "Liability" : "Asset"}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Balance</p>
          <p className="text-2xl font-semibold">
            ₱{phpValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {isNonPHP && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {account.currency.toUpperCase()} {account.balance.toLocaleString()} × ₱{rate.toFixed(2)}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <p>{account.liquidity.replace("_", " ")}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(account); }}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
        >
          Update
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:border-rose-300 dark:border-rose-500/50 dark:text-rose-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
