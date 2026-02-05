"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrencies } from "@/lib/fx";

const currencyNames: Record<string, string> = {
  PHP: "Philippine Peso",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  HKD: "Hong Kong Dollar",
  SGD: "Singapore Dollar",
  KRW: "South Korean Won",
  INR: "Indian Rupee",
  THB: "Thai Baht",
  MYR: "Malaysian Ringgit",
  IDR: "Indonesian Rupiah",
  VND: "Vietnamese Dong",
  BTC: "Bitcoin",
  ETH: "Ethereum",
};

type CurrencySelectProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function CurrencySelect({ value, onChange, error }: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const { data: currencyCodes } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
    staleTime: 12 * 60 * 60 * 1000,
  });

  const currencies = currencyCodes
    ? Object.keys(currencyCodes).map((code) => ({
        code,
        name: currencyNames[code] || code,
      }))
    : [];

  const filtered = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    if (isOpen) {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedCurrency = currencies.find((c) => c.code === value.toUpperCase());

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input flex items-center justify-between"
      >
        <span className="font-semibold">{value.toUpperCase() || "Select"}</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

      {isOpen && (
        <div
          className="fixed z-[100] rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Search currencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                No currencies found
              </div>
            ) : (
              filtered.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-900 ${
                    value.toUpperCase() === currency.code ? "bg-slate-100 dark:bg-slate-900" : ""
                  }`}
                >
                  <div className="text-sm font-semibold">{currency.code}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{currency.name}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
