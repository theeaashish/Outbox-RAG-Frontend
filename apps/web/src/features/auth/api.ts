import { apiClient, isApiError } from "@/lib/api";
import type { LoginInput, RegisterInput, User } from "./types";

const AUTH_BASE_PATH = "/api/v1/auth";

export async function getCurrentUser(
  options: { signal?: AbortSignal } = {}
): Promise<User | null> {
  try {
    return await apiClient.get<User>(`${AUTH_BASE_PATH}/me`, {
      signal: options.signal,
    });
  } catch (error) {
    // 401 Unauthorized represents an anonymous / guest visitor, not an application failure
    if (isApiError(error) && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function login(
  input: LoginInput,
  options: { signal?: AbortSignal } = {}
): Promise<User> {
  return apiClient.post<User>(`${AUTH_BASE_PATH}/login`, input, {
    signal: options.signal,
  });
}

export function register(
  input: RegisterInput,
  options: { signal?: AbortSignal } = {}
): Promise<User> {
  return apiClient.post<User>(`${AUTH_BASE_PATH}/register`, input, {
    signal: options.signal,
  });
}

export function logout(options: { signal?: AbortSignal } = {}): Promise<void> {
  return apiClient.post<void>(`${AUTH_BASE_PATH}/logout`, undefined, {
    signal: options.signal,
  });
}

export function logoutAll(
  options: { signal?: AbortSignal } = {}
): Promise<void> {
  return apiClient.post<void>(`${AUTH_BASE_PATH}/logout-all`, undefined, {
    signal: options.signal,
  });
}
