"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Account } from "@/types/db";

type CompositionChartProps = {
  accounts: Account[];
};

const COLORS = {
  liquidAssets: "#14b8a6",
  semiLiquidAssets: "#0ea5e9",
  illiquidAssets: "#a855f7",
  liabilities: "#f43f5e",
};

export default function CompositionChart({ accounts }: CompositionChartProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  React.useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = () => {
      setShowTooltip(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showTooltip]);

  const data = [
    {
      name: "Liquid Assets",
      value: accounts
        .filter((a) => !a.is_liability && a.liquidity === "liquid")
        .reduce((sum, a) => sum + a.balance, 0),
      color: COLORS.liquidAssets,
    },
    {
      name: "Semi-Liquid Assets",
      value: accounts
        .filter((a) => !a.is_liability && a.liquidity === "semi_liquid")
        .reduce((sum, a) => sum + a.balance, 0),
      color: COLORS.semiLiquidAssets,
    },
    {
      name: "Illiquid Assets",
      value: accounts
        .filter((a) => !a.is_liability && a.liquidity === "illiquid")
        .reduce((sum, a) => sum + a.balance, 0),
      color: COLORS.illiquidAssets,
    },
    {
      name: "Liabilities",
      value: accounts.filter((a) => a.is_liability).reduce((sum, a) => sum + a.balance, 0),
      color: COLORS.liabilities,
    },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return null;
  }

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return "₱0";
    return `₱${value.toLocaleString()}`;
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show label if slice is too small

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        <tspan x={x} dy="-0.5em" className="text-[11px]">
          {name.replace(" Assets", "")}
        </tspan>
        <tspan x={x} dy="1.2em" className="text-sm font-bold">
          {`${(percent * 100).toFixed(0)}%`}
        </tspan>
      </text>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card h-[400px]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Portfolio Composition</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">By liquidity & type</p>
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
              Breaks down assets by <strong>access speed:</strong> liquid (immediate), semi-liquid (days), illiquid (weeks/months). Shows your debt too.
              <div className="absolute -top-1 right-2 h-2 w-2 rotate-45 border-l border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={formatCurrency}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
