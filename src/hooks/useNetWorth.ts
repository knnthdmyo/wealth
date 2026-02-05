import { useQuery } from "@tanstack/react-query";
import { fetchAccountHistory, fetchAccounts } from "@/lib/api";
import { fetchFxRates } from "@/lib/fx";
import type { Account } from "@/types/db";

export type NetWorthSummary = {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  liquidPercent: number;
  history: { date: string; netWorth: number }[];
};

function computeCurrentTotals(accounts: Account[], fxRates: Record<string, number>) {
  let totalAssets = 0;
  let totalLiabilities = 0;
  let liquidAssets = 0;

  for (const account of accounts) {
    const rate =
      account.currency.toUpperCase() === "PHP" ? 1 : (fxRates[account.currency.toUpperCase()] ?? 0);
    const value = account.balance * rate;

    if (account.is_liability) {
      totalLiabilities += value;
    } else {
      totalAssets += value;
      if (account.liquidity === "liquid") {
        liquidAssets += value;
      }
    }
  }

  const liquidPercent = totalAssets === 0 ? 0 : (liquidAssets / totalAssets) * 100;

  return {
    totalAssets,
    totalLiabilities,
    totalNetWorth: totalAssets - totalLiabilities,
    liquidPercent,
  };
}

function computeHistory(records: Awaited<ReturnType<typeof fetchAccountHistory>>) {
  const byDate = new Map<string, number>();

  for (const record of records) {
    const rate = record.fx_rate_used ?? 1;
    const value = record.balance * rate;
    const sign = record.accounts?.is_liability ? -1 : 1;
    const current = byDate.get(record.date) ?? 0;
    byDate.set(record.date, current + sign * value);
  }

  return Array.from(byDate.entries())
    .map(([date, netWorth]) => ({ date, netWorth }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function useNetWorth() {
  return useQuery<NetWorthSummary>({
    queryKey: ["netWorth"],
    queryFn: async () => {
      const accounts = await fetchAccounts();
      const currencies = accounts
        .map((account) => account.currency.toUpperCase())
        .filter((currency) => currency !== "PHP");
      const fxRates = currencies.length ? await fetchFxRates(currencies) : {};
      const totals = computeCurrentTotals(accounts, fxRates);
      const historyRecords = await fetchAccountHistory();
      const history = computeHistory(historyRecords);

      return {
        ...totals,
        history,
      };
    },
  });
}
