"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

type BalanceChartProps = {
  data: { date: string; netWorth: number }[];
};

const formatShortCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1_000_000_000) {
    return `${sign}₱${(absNum / 1_000_000_000).toFixed(1)}B`;
  }
  if (absNum >= 1_000_000) {
    return `${sign}₱${(absNum / 1_000_000).toFixed(1)}M`;
  }
  if (absNum >= 1_000) {
    return `${sign}₱${(absNum / 1_000).toFixed(1)}k`;
  }
  return `${sign}₱${Math.round(absNum)}`;
};

export default function BalanceChart({ data }: BalanceChartProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  React.useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = () => {
      setShowTooltip(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showTooltip]);

  return (
    <div className="card h-64">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Net Worth History</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Last {data.length} entries</p>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-6 z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Shows how your <strong>net worth changes</strong> over time. Line going up means building wealth, down means expenses or debt payments.
              <div className="absolute -top-1 right-2 h-2 w-2 rotate-45 border-l border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="75%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => dayjs(value).format("MMM D")}
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => formatShortCurrency(value)}
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => formatShortCurrency(Number(value))}
            labelFormatter={(label) => dayjs(label).format("MMM D, YYYY")}
          />
          <Line type="monotone" dataKey="netWorth" stroke="#38bdf8" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
