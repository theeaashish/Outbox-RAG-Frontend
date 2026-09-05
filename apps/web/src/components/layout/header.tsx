"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Logo, useScroll, cn, ThemeToggle } from "@repo/ui";
import { MobileNav } from "./mobile-nav";
import { navLinks, type NavItem } from "./nav-links";

export type { NavItem };

export interface HeaderProps extends React.ComponentProps<"header"> {
  links?: NavItem[];
  logoHref?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Header({
  links = navLinks,
  logoHref = "/",
  logo,
  actions,
  className,
  ...props
}: HeaderProps) {
  const scrolled = useScroll(10);

  const defaultActions = (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-8 rounded-lg border-zinc-200 bg-white px-3.5 text-xs font-medium text-zinc-900 shadow-xs hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        render={<Link href="/login" />}
        nativeButton={false}
      >
        Sign In
      </Button>
      <Button
        size="sm"
        className="h-8 rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        render={<Link href="/register" />}
        nativeButton={false}
      >
        Get Started
      </Button>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent transition-colors",
        scrolled &&
          "border-border bg-zinc-50/90 backdrop-blur-sm supports-backdrop-filter:bg-zinc-50/75",
        className
      )}
      {...props}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        {/* Left: Brand Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            className="inline-flex items-center rounded-lg p-1.5 hover:bg-muted dark:hover:bg-muted/50 transition-colors"
            href={logoHref}
            aria-label="Home"
          >
            {logo ?? <Logo />}
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center justify-center gap-1">
          {links.map((link) => (
            <Button
              key={link.label}
              size="sm"
              variant="ghost"
              render={<Link href={link.href} />}
              nativeButton={false}
            >
              {link.label}
            </Button>
          ))}
        </div>

        {/* Right: Actions and Mobile menu */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="hidden md:flex items-center gap-2">
            {actions ?? defaultActions}
            <ThemeToggle collapsed />
          </div>
          <ThemeToggle collapsed className="md:hidden" />
          <MobileNav links={links} actions={actions ?? defaultActions} />
        </div>
      </nav>
    </header>
  );
}
