"use client";

import { useRouter } from "next/navigation";
import { AuthCard, type SocialProvider } from "@repo/ui";
import { toast } from "sonner";
import { parseRegisterFormData, useRegister } from "@/features/auth";

export function RegisterView() {
  const router = useRouter();
  const registerMutation = useRegister();

  const handleSubmit = async (data: FormData) => {
    const result = parseRegisterFormData(data);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast.error(firstIssue?.message ?? "Invalid input");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: result.data.email,
        password: result.data.password,
        name: result.data.name,
      });
      toast.success("Account created!", {
        description: "Please sign in with your credentials to continue.",
      });
      router.push("/login");
    } catch (error) {
      toast.error("Account creation failed", {
        description:
          error instanceof Error
            ? error.message
            : "Unable to create account. Please try again.",
      });
    }
  };

  const handleProvider = (provider: SocialProvider) => {
    console.log("OAuth provider selected:", provider);
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    toast.info(`Continuing with ${providerName}...`);
  };

  return (
    <AuthCard
      mode="signup"
      title="Create your account"
      description="Start searching, organizing, and indexing your documents with Outbox."
      switchHref="/login"
      providers={["google", "github"]}
      isSubmitting={registerMutation.isPending}
      onSubmit={handleSubmit}
      onProvider={handleProvider}
    />
  );
}
