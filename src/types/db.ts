export type AccountCategory =
  | "emergency"
  | "savings"
  | "discretionary"
  | "investment"
  | "retirement"
  | "business"
  | "debt";

export type AccountLiquidity = "liquid" | "semi_liquid" | "illiquid";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  category: AccountCategory;
  liquidity: AccountLiquidity;
  currency: string;
  balance: number;
  is_liability: boolean;
  created_at: string;
  updated_at: string;
};

export type AccountInsert = Omit<Account, "id" | "user_id" | "created_at" | "updated_at">;

export type AccountHistory = {
  id: string;
  account_id: string;
  date: string;
  balance: number;
  fx_rate_used: number | null;
};

export type AccountHistoryWithAccount = AccountHistory & {
  accounts?: {
    is_liability: boolean;
    user_id: string;
  } | null;
};
