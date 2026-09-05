"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, Toaster } from "@repo/ui";
import { getQueryClient } from "@/lib/query";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="theme"
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
