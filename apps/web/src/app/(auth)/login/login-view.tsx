"use client";

import { useRouter } from "next/navigation";
import { AuthCard, AuthMediaCarousel, type SocialProvider } from "@repo/ui";
import { toast } from "sonner";
import { parseLoginFormData, useLogin } from "@/features/auth";
import { authCarouselSlides } from "../_components/auth-slides";

export function LoginView() {
  const router = useRouter();
  const loginMutation = useLogin();

  const handleSubmit = async (data: FormData) => {
    const result = parseLoginFormData(data);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast.error(firstIssue?.message ?? "Invalid input");
      return;
    }

    try {
      await loginMutation.mutateAsync(result.data);
      toast.success("Welcome back!", {
        description: "Signed in successfully.",
      });
      router.push(getSafeRedirectUrl());
    } catch (error) {
      toast.error("Sign in failed", {
        description:
          error instanceof Error
            ? error.message
            : "Invalid credentials. Please try again.",
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
      mode="signin"
      switchHref="/register"
      providers={["google", "github"]}
      isSubmitting={loginMutation.isPending}
      onSubmit={handleSubmit}
      onProvider={handleProvider}
      media={<AuthMediaCarousel slides={authCarouselSlides} />}
    />
  );
}

function getSafeRedirectUrl(): string {
  const requestedUrl = new URLSearchParams(window.location.search).get("from");
  if (!requestedUrl) return "/dashboard";

  try {
    const target = new URL(requestedUrl, window.location.origin);
    if (
      target.origin !== window.location.origin ||
      !target.pathname.startsWith("/") ||
      requestedUrl.startsWith("//")
    ) {
      return "/dashboard";
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/dashboard";
  }
}
