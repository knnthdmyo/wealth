"use client";

import dynamic from "next/dynamic";
import CompositionChart from "@/components/CompositionChart";
import type { Account } from "@/types/db";

const BalanceChart = dynamic(() => import("@/components/BalanceChart"), {
  ssr: false,
  loading: () => <div className="skeleton card h-64 bg-slate-100 dark:bg-slate-900/60" />,
});

type HistorySectionProps = {
  history: { date: string; netWorth: number }[] | undefined;
  accounts: Account[];
};

export default function HistorySection({ history, accounts }: HistorySectionProps) {
  return (
    <section className="mt-6 space-y-6">
      <div>
        {history?.length ? (
          <BalanceChart data={history} />
        ) : (
          <div className="card text-sm text-slate-500 dark:text-slate-400">
            Net worth history will appear after you update account balances.
          </div>
        )}
      </div>

      {accounts.length > 0 && (
        <div>
          <CompositionChart accounts={accounts} />
        </div>
      )}
    </section>
  );
}
