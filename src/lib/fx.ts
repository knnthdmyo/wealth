export type FxRateResponse = {
  base: string;
  target: string;
  rate: number;
  updatedAt: string;
};

export async function fetchFxRate(base: string) {
  const response = await fetch(`/api/fx?base=${encodeURIComponent(base)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch FX rate");
  }
  return (await response.json()) as FxRateResponse;
}

export async function fetchFxRates(bases: string[]) {
  const uniqueBases = Array.from(new Set(bases.map((b) => b.toUpperCase())));
  const entries = await Promise.all(
    uniqueBases.map(async (base) => {
      const result = await fetchFxRate(base);
      return [base, result.rate] as const;
    })
  );

  return Object.fromEntries(entries) as Record<string, number>;
}

export async function fetchCurrencies() {
  const response = await fetch("/api/fx?action=currencies");
  if (!response.ok) {
    throw new Error("Failed to fetch currencies");
  }
  return (await response.json()) as Record<string, string>;
}
