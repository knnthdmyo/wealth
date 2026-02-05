import { NextResponse } from "next/server";

type CacheEntry = {
  rate: number;
  timestamp: number;
};

type CurrenciesCache = {
  data: Record<string, string>;
  timestamp: number;
};

const CACHE_TTL = 12 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();
let currenciesCache: CurrenciesCache | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base");
  const action = searchParams.get("action");

  if (action === "currencies") {
    if (currenciesCache && Date.now() - currenciesCache.timestamp < CACHE_TTL) {
      return NextResponse.json(currenciesCache.data);
    }

    const response = await fetch("https://api.exchangerate-api.com/v4/latest/PHP", {
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 502 });
    }

    const data = (await response.json()) as { rates?: Record<string, number> };
    const currencies = data.rates ? Object.keys(data.rates) : [];

    const currencyMap: Record<string, string> = {};
    currencies.forEach((code) => {
      currencyMap[code] = code;
    });

    currenciesCache = {
      data: currencyMap,
      timestamp: Date.now(),
    };

    return NextResponse.json(currencyMap);
  }

  if (!base) {
    return NextResponse.json({ error: "Missing base parameter" }, { status: 400 });
  }

  const baseUpper = base.toUpperCase();

  const cached = cache.get(baseUpper);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      base: baseUpper,
      target: "PHP",
      rate: cached.rate,
      updatedAt: new Date(cached.timestamp).toISOString(),
    });
  }

  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(baseUpper)}`,
    { next: { revalidate: 60 * 60 * 12 } }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "FX lookup failed" }, { status: 502 });
  }

  const data = (await response.json()) as { rates?: Record<string, number> };
  const rate = data.rates?.PHP;

  if (!rate) {
    return NextResponse.json({ error: "Rate unavailable" }, { status: 404 });
  }

  cache.set(baseUpper, { rate, timestamp: Date.now() });

  return NextResponse.json({
    base: baseUpper,
    target: "PHP",
    rate,
    updatedAt: new Date().toISOString(),
  });
}
