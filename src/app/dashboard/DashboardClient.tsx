"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import AccountCard from "@/components/AccountCard";
import Modal from "@/components/Modal";
import CurrencySelect from "@/components/CurrencySelect";
import HistorySection from "@/components/HistorySection";
import { useAccounts } from "@/hooks/useAccounts";
import { useNetWorth } from "@/hooks/useNetWorth";
import { supabase } from "@/lib/supabaseClient";
import type { Account, AccountInsert } from "@/types/db";

const BalanceChart = dynamic(() => import("@/components/BalanceChart"), {
  ssr: false,
  loading: () => <div className="skeleton card h-64 bg-slate-100 dark:bg-slate-900/60" />,
});

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  category: z.enum([
    "emergency",
    "savings",
    "discretionary",
    "investment",
    "retirement",
    "business",
    "debt",
  ]),
  liquidity: z.enum(["liquid", "semi_liquid", "illiquid"]),
  currency: z.string().min(3).max(3),
  balance: z.number().min(0),
  is_liability: z.boolean(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export default function DashboardClient() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyAccount, setHistoryAccount] = useState<Account | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [userTitle, setUserTitle] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState<"overview" | "accounts">("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");

  const { accounts, isLoading, createAccount, updateAccount, deleteAccount } = useAccounts();
  const { data: netWorth } = useNetWorth();

  const { data: accountHistory } = useQuery({
    queryKey: ["accountHistory", historyAccount?.id],
    queryFn: async () => {
      if (!historyAccount) return [];
      const { data, error } = await supabase
        .from("account_history")
        .select("date, balance, fx_rate_used")
        .eq("account_id", historyAccount.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!historyAccount && isHistoryModalOpen,
  });

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!activeTooltip) return;

    const handleClickOutside = () => {
      setActiveTooltip(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeTooltip]);

  const filteredAccounts = useMemo(() => {
    let filtered = accounts.filter((account) => {
      // Filter by category
      if (filterCategory !== "all" && account.category !== filterCategory) {
        return false;
      }
      // Filter by type (asset/liability)
      if (filterType === "assets" && account.is_liability) {
        return false;
      }
      if (filterType === "liabilities" && !account.is_liability) {
        return false;
      }
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          account.name.toLowerCase().includes(query) ||
          account.provider.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "balance-high":
          return b.balance - a.balance;
        case "balance-low":
          return a.balance - b.balance;
        case "provider":
          return a.provider.localeCompare(b.provider);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [accounts, filterCategory, filterType, searchQuery, sortBy]);

  const filteredTotal = useMemo(() => {
    return filteredAccounts.reduce((sum, account) => {
      return sum + (account.is_liability ? -account.balance : account.balance);
    }, 0);
  }, [filteredAccounts]);

  const defaultValues: AccountFormValues = useMemo(
    () => ({
      name: "",
      provider: "",
      category: "savings",
      liquidity: "liquid",
      currency: "PHP",
      balance: 0,
      is_liability: false,
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues,
  });

  const currencyValue = watch("currency");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        const email = data.session.user.email ?? "Dashboard";
        setUserTitle(email.split("@")[0]);
        setCheckingAuth(false);
      }
    });
  }, [router]);

  useEffect(() => {
    if (editingAccount) {
      reset({
        name: editingAccount.name,
        provider: editingAccount.provider,
        category: editingAccount.category,
        liquidity: editingAccount.liquidity,
        currency: editingAccount.currency,
        balance: editingAccount.balance,
        is_liability: editingAccount.is_liability,
      });
    } else {
      reset(defaultValues);
    }
  }, [editingAccount, reset, defaultValues]);

  const onSubmit = (values: AccountFormValues) => {
    const payload: AccountInsert = {
      ...values,
      currency: values.currency.toUpperCase(),
    };

    if (editingAccount) {
      updateAccount.mutate(
        { id: editingAccount.id, input: payload },
        {
          onSuccess: () => handleCloseModal(),
        }
      );
    } else {
      createAccount.mutate(payload, {
        onSuccess: () => handleCloseModal(),
      });
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleViewHistory = (account: Account) => {
    setHistoryAccount(account);
    setIsHistoryModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
    reset(defaultValues);
  };

  const summaryCards = [
    {
      label: "Total Net Worth",
      value: currencyFormatter.format(netWorth?.totalNetWorth ?? 0),
      hint: "Updated today",
      tooltip: "What you'd have left after selling everything and paying all debts. <strong>Assets minus liabilities.</strong>",
    },
    {
      label: "Assets",
      value: currencyFormatter.format(netWorth?.totalAssets ?? 0),
      hint: "All accounts",
      tooltip: "Everything <strong>valuable you own:</strong> cash, investments, retirement accounts, property, and other accounts.",
    },
    {
      label: "Liabilities",
      value: currencyFormatter.format(netWorth?.totalLiabilities ?? 0),
      hint: "Debt & obligations",
      tooltip: "All <strong>money you owe:</strong> credit cards, loans, mortgages, and other debts.",
    },
    {
      label: "Liquid %",
      value: `${(netWorth?.liquidPercent ?? 0).toFixed(1)}%`,
      hint: "Liquidity ratio",
      tooltip: "Percentage of assets that can be <strong>quickly turned into cash.</strong> Higher means easier access to money in emergencies.",
    },
  ];

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title={userTitle} />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLogout={async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        }}
      />

      <main className="mx-auto w-full max-w-[480px] space-y-6 px-4 pb-28">
        {activeTab === "overview" ? (
          <div className="animate-fade-in">
            <section className="grid gap-4">
              {netWorth === undefined ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card">
                      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-3 h-8 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-2 h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </>
              ) : (
                summaryCards.map((card) => (
                  <div key={card.label} className="card relative">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {card.label}
                      </p>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltip(activeTooltip === card.label ? null : card.label);
                          }}
                          className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
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
                        {activeTooltip === card.label && (
                          <div className="absolute right-0 top-6 z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <span dangerouslySetInnerHTML={{ __html: card.tooltip }} />
                            <div className="absolute -top-1 right-2 h-2 w-2 rotate-45 border-l border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.hint}</p>
                  </div>
                ))
              )}
            </section>

            <HistorySection history={netWorth?.history} accounts={accounts} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <Modal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              title={editingAccount ? "Update account" : "Add account"}
            >
              <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-1">
                  <label className="label" htmlFor="name">
                    Account name
                  </label>
                  <input id="name" className="input" {...register("name")} />
                  {errors.name ? (
                    <p className="text-xs text-rose-500">{errors.name.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-1">
                  <label className="label" htmlFor="provider">
                    Provider
                  </label>
                  <input id="provider" className="input" {...register("provider")} />
                  {errors.provider ? (
                    <p className="text-xs text-rose-500">{errors.provider.message}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <label className="label" htmlFor="category">
                      Category
                    </label>
                    <select id="category" className="input" {...register("category")}>
                      <option value="emergency">Emergency</option>
                      <option value="savings">Savings</option>
                      <option value="discretionary">Discretionary</option>
                      <option value="investment">Investment</option>
                      <option value="retirement">Retirement</option>
                      <option value="business">Business</option>
                      <option value="debt">Debt</option>
                    </select>
                  </div>
                  <div className="grid gap-1">
                    <label className="label" htmlFor="liquidity">
                      Liquidity
                    </label>
                    <select id="liquidity" className="input" {...register("liquidity")}>
                      <option value="liquid">Liquid</option>
                      <option value="semi_liquid">Semi-liquid</option>
                      <option value="illiquid">Illiquid</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-[80px_1fr] gap-4">
                  <div className="grid gap-1">
                    <label className="label" htmlFor="currency">
                      Currency
                    </label>
                    <CurrencySelect
                      value={currencyValue}
                      onChange={(value) => setValue("currency", value)}
                      error={errors.currency?.message}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="label" htmlFor="balance">
                      Balance
                    </label>
                    <input
                      id="balance"
                      type="number"
                      step="0.01"
                      className="input"
                      {...register("balance", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  <span>Mark as liability</span>
                  <input type="checkbox" className="h-4 w-4" {...register("is_liability")} />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600"
                  disabled={createAccount.isPending || updateAccount.isPending}
                >
                  {createAccount.isPending || updateAccount.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent dark:border-slate-900 dark:border-t-transparent" />
                      {editingAccount ? "Updating..." : "Saving..."}
                    </span>
                  ) : editingAccount ? (
                    "Update account"
                  ) : (
                    "Save account"
                  )}
                </button>
              </form>
            </Modal>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Accounts ({filteredAccounts.length})</p>
                <div className="flex items-center gap-2">
                  {(searchQuery || filterCategory !== "all" || filterType !== "all") && (
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {currencyFormatter.format(filteredTotal)}
                    </p>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`rounded-full p-2 ${
                      showFilters
                        ? "bg-teal-500 text-white hover:bg-teal-600"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                    title={showFilters ? "Hide filters" : "Show filters"}
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
                        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-full bg-teal-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-600"
                  >
                    Add Account
                  </button>
                </div>
              </div>

              {/* Floating Filter Panel */}
              {showFilters && (
                <div className="relative">
                  <div className="absolute right-0 top-2 z-50 w-80 max-w-[calc(100vw-2rem)]">
                    <div className="card space-y-3 shadow-2xl">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-semibold">Filter & Sort</h3>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                />

                {/* Filter by Type */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      filterType === "all"
                        ? "bg-teal-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("assets")}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      filterType === "assets"
                        ? "bg-teal-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    Assets
                  </button>
                  <button
                    onClick={() => setFilterType("liabilities")}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      filterType === "liabilities"
                        ? "bg-teal-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    Liabilities
                  </button>
                </div>

                {/* Filter by Category */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="all">All Categories</option>
                  <option value="emergency">Emergency</option>
                  <option value="savings">Savings</option>
                  <option value="discretionary">Discretionary</option>
                  <option value="investment">Investment</option>
                  <option value="retirement">Retirement</option>
                  <option value="business">Business</option>
                  <option value="debt">Debt</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="name">Sort by Name</option>
                  <option value="balance-high">Balance (High to Low)</option>
                  <option value="balance-low">Balance (Low to High)</option>
                  <option value="provider">Provider</option>
                  <option value="category">Category</option>
                </select>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCategory("all");
                    setFilterType("all");
                    setSortBy("name");
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Clear All Filters
                </button>
                    </div>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="skeleton h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="skeleton h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <div className="skeleton h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                      </div>
                      <div className="flex items-end justify-between pt-2">
                        <div className="space-y-2">
                          <div className="skeleton h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="skeleton h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <div className="skeleton h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <div className="skeleton h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="skeleton h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="card text-sm text-slate-500 dark:text-slate-400">
                  {searchQuery || filterCategory !== "all" || filterType !== "all"
                    ? "No accounts match the filters."
                    : "Add your first account to start tracking net worth."}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onEdit={handleEdit}
                      onDelete={(id) => deleteAccount.mutate(id)}
                      onViewHistory={handleViewHistory}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`${historyAccount?.name} - Balance History`}
      >
        <div className="space-y-4">
          {accountHistory && accountHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="pb-2 text-left font-semibold text-slate-600 dark:text-slate-400">Date</th>
                    <th className="pb-2 text-right font-semibold text-slate-600 dark:text-slate-400">Balance ({historyAccount?.currency})</th>
                    <th className="pb-2 text-right font-semibold text-slate-600 dark:text-slate-400">PHP Value</th>
                    <th className="pb-2 text-right font-semibold text-slate-600 dark:text-slate-400">FX Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {accountHistory.map((record: any, idx: number) => {
                    const phpValue = record.balance * record.fx_rate_used;
                    return (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 text-slate-700 dark:text-slate-300">
                          {new Date(record.date).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            year: "numeric" 
                          })}
                        </td>
                        <td className="py-3 text-right text-slate-700 dark:text-slate-300">
                          {record.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                          ₱{phpValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                          ₱{record.fx_rate_used.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
              No history records found for this account.
            </p>
          )}
        </div>
      </Modal>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onMenuClick={() => setIsMenuOpen(true)} />
    </div>
  );
}
