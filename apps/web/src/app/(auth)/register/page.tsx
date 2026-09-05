import type { Metadata } from "next";
import { RegisterView } from "./register-view";

export const metadata: Metadata = {
  title: "Create an account | Basic RAG",
  description:
    "Create your Basic RAG account to begin organizing your knowledge base.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
