export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string | null;
}

export type AuthStatus = "unknown" | "anonymous" | "authenticated";
