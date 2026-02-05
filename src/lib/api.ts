import dayjs from "dayjs";
import { supabase } from "./supabaseClient";
import type { Account, AccountHistoryWithAccount, AccountInsert } from "@/types/db";
import { fetchFxRate } from "./fx";

async function getUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user?.id ?? null;
}

export async function fetchAccounts() {
  const userId = await getUserId();
  if (!userId) return [] as Account[];

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Account[];
}

export async function createAccount(input: AccountInsert) {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { data: inserted, error } = await supabase
    .from("accounts")
    .insert({ ...input, user_id: userId })
    .select("*")
    .single();

  if (error) throw error;

  const fxRate = await fetchFxRate(input.currency);
  await supabase.from("account_history").insert({
    account_id: inserted.id,
    date: dayjs().format("YYYY-MM-DD"),
    balance: input.balance,
    fx_rate_used: fxRate.rate,
  });

  return inserted as Account;
}

export async function updateAccount(id: string, input: AccountInsert) {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { data: updated, error } = await supabase
    .from("accounts")
    .update({ ...input, user_id: userId })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  const fxRate = await fetchFxRate(input.currency);
  await supabase.from("account_history").insert({
    account_id: id,
    date: dayjs().format("YYYY-MM-DD"),
    balance: input.balance,
    fx_rate_used: fxRate.rate,
  });

  return updated as Account;
}

export async function deleteAccount(id: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase.from("accounts").delete().eq("id", id).eq("user_id", userId);

  if (error) throw error;
}

export async function fetchAccountHistory() {
  const userId = await getUserId();
  if (!userId) return [] as AccountHistoryWithAccount[];

  const { data, error } = await supabase
    .from("account_history")
    .select("id, account_id, date, balance, fx_rate_used, accounts(user_id, is_liability)")
    .eq("accounts.user_id", userId)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AccountHistoryWithAccount[];
}
