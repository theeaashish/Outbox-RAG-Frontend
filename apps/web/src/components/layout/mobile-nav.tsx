"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { Button, Portal, PortalBackdrop, cn } from "@repo/ui";
import { navLinks, type NavItem } from "./nav-links";

export interface MobileNavProps {
  links?: NavItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function MobileNav({
  links = navLinks,
  actions,
  className,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  // Close menu on Escape key
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const defaultActions = (
    <>
      <Button
        className="w-full rounded-lg border-zinc-200 bg-white text-xs font-medium text-zinc-900 shadow-xs hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        variant="outline"
        render={<Link href="/login" onClick={() => setOpen(false)} />}
        nativeButton={false}
      >
        Sign In
      </Button>
      <Button
        className="w-full rounded-lg bg-zinc-900 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        render={<Link href="/register" onClick={() => setOpen(false)} />}
        nativeButton={false}
      >
        Get Started
      </Button>
    </>
  );

  return (
    <div className={cn("md:hidden", className)}>
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        className="md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon
          icon={open ? Cancel01Icon : Menu01Icon}
          strokeWidth={2}
          className="size-4.5"
        />
      </Button>

      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop onClick={() => setOpen(false)} />
          <div
            className={cn(
              "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
              "size-full p-4"
            )}
            data-slot={open ? "open" : "closed"}
          >
            <div className="grid gap-y-2">
              {links.map((link) => (
                <Button
                  key={link.label}
                  className="justify-start"
                  variant="ghost"
                  render={
                    <Link href={link.href} onClick={() => setOpen(false)} />
                  }
                  nativeButton={false}
                >
                  {link.label}
                </Button>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-2">
              {actions ?? defaultActions}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
