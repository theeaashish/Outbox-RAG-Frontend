"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BoardButton } from "@repo/ui";
import { useCurrentUser } from "@/features/auth";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useCurrentUser();

  useEffect(() => {
    if (auth.isAnonymous) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [auth.isAnonymous, pathname, router]);

  if (auth.isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-zinc-100/70 p-4 text-center dark:bg-zinc-950">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Failed to load workspace
        </p>
        <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-400">
          {auth.error instanceof Error
            ? auth.error.message
            : "An error occurred while verifying your session."}
        </p>
        <BoardButton
          variant="secondary"
          size="small"
          onClick={() => void auth.refetch()}
        >
          Retry
        </BoardButton>
      </div>
    );
  }

  if (auth.isPending || (auth.isUnknown && !auth.isAnonymous)) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-100/70 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        Loading workspace...
      </div>
    );
  }

  if (auth.isAnonymous) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-100/70 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        Redirecting to login...
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}

