"use client";

import * as React from "react";
import { AuthCard, AuthMediaCarousel, type SocialProvider } from "@repo/ui";
import { toast } from "sonner";
import { authCarouselSlides } from "../_components/auth-slides";

export function LoginView() {
  const handleSubmit = (data: FormData) => {
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    console.log("Sign-in submission:", {
      email,
      hasPassword: Boolean(password),
    });
    toast.info("Sign in submitted", {
      description: `Attempting sign-in for ${email}`,
    });
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
      onSubmit={handleSubmit}
      onProvider={handleProvider}
      media={<AuthMediaCarousel slides={authCarouselSlides} />}
    />
  );
}
