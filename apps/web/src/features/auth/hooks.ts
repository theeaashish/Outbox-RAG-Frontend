"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login, logout, logoutAll, register } from "./api";
import { authKeys } from "./keys";
import type { AuthStatus, LoginInput, RegisterInput, User } from "./types";

/**
 * On-demand hook to retrieve the current user and authentication status.
 *
 * 3-state auth model:
 * - isUnknown: boolean (pending / undefined)
 * - isAnonymous: boolean (null)
 * - isAuthenticated: boolean (User object present)
 */
export function useCurrentUser() {
  const query = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: ({ signal }) => getCurrentUser({ signal }),
  });

  const isUnknown = query.isPending || query.data === undefined;
  const isAnonymous = query.data === null;
  const isAuthenticated = Boolean(query.data);

  const status: AuthStatus = isUnknown
    ? "unknown"
    : isAuthenticated
      ? "authenticated"
      : "anonymous";

  return {
    ...query,
    user: query.data ?? null,
    status,
    isUnknown,
    isAnonymous,
    isAuthenticated,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user: User) => {
      // Direct cache write avoids an extra network round-trip to /me
      queryClient.setQueryData(authKeys.currentUser(), user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Scoped cache update: explicitly set current user to null on successful server logout
      queryClient.setQueryData(authKeys.currentUser(), null);
    },
  });
}

export function useLogoutAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutAll(),
    onSuccess: () => {
      // Scoped cache update: explicitly set current user to null on successful server logout
      queryClient.setQueryData(authKeys.currentUser(), null);
    },
  });
}
