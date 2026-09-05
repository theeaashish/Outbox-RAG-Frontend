"use client";

import * as React from "react";
import { AuthCard, AuthMediaCarousel, type SocialProvider } from "@repo/ui";
import { toast } from "sonner";
import { authCarouselSlides } from "../_components/auth-slides";

export function RegisterView() {
  const handleSubmit = (data: FormData) => {
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (confirmPassword && password !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please check your password and try again.",
      });
      return;
    }

    console.log("Registration submission:", { name, email });
    toast.info("Account creation submitted", {
      description: `Creating account for ${name || email}...`,
    });
  };

  const handleProvider = (provider: SocialProvider) => {
    console.log("OAuth provider selected:", provider);
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    toast.info(`Continuing with ${providerName}...`);
  };

  return (
    <AuthCard
      mode="signup"
      confirmPassword
      title="Create your account"
      description="Start searching, organizing, and indexing your documents with Basic RAG."
      switchHref="/login"
      providers={["google", "github"]}
      onSubmit={handleSubmit}
      onProvider={handleProvider}
      media={<AuthMediaCarousel slides={authCarouselSlides} />}
    />
  );
}
