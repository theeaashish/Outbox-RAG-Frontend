import type { Metadata } from "next";
import { LoginView } from "./login-view";

export const metadata: Metadata = {
  title: "Sign In | Basic RAG",
  description:
    "Sign in to your Basic RAG account to access your knowledge base and assistants.",
};

export default function LoginPage() {
  return <LoginView />;
}
