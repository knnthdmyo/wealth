import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, AccountInsert } from "@/types/db";
import { createAccount, deleteAccount, fetchAccounts, updateAccount } from "@/lib/api";

export function useAccounts() {
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const createMutation = useMutation({
    mutationFn: (input: AccountInsert) => createAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["netWorth"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AccountInsert }) => updateAccount(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["netWorth"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["netWorth"] });
    },
  });

  return {
    accounts: (accountsQuery.data ?? []) as Account[],
    isLoading: accountsQuery.isLoading,
    error: accountsQuery.error,
    createAccount: createMutation,
    updateAccount: updateMutation,
    deleteAccount: deleteMutation,
  };
}
