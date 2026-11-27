"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Button, Logo, useScroll, cn, ThemeToggle } from "@repo/ui";
import { MobileNav } from "./mobile-nav";
import { navLinks, type NavItem } from "./nav-links";

export type { NavItem };

export interface HeaderProps extends ComponentProps<"header"> {
  links?: NavItem[];
  logoHref?: string;
  logo?: ReactNode;
  actions?: ReactNode;
  overlay?: boolean;
}

export function Header({
  links = navLinks,
  logoHref = "/",
  logo,
  actions,
  overlay = false,
  className,
  ...props
}: HeaderProps) {
  const scrolled = useScroll(10);
  const isOverSky = overlay && !scrolled;

  const defaultActions = (
    <>
      <Button
        size="sm"
        variant="outline"
        className={cn(
          "h-7 rounded-lg px-3 text-xs font-medium shadow-xs transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]",
          isOverSky
            ? "border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/18 hover:text-white"
            : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        )}
        render={<Link href="/login" />}
        nativeButton={false}
      >
        Sign In
      </Button>
      <Button
        size="sm"
        className={cn(
          "h-7 rounded-lg px-3 text-xs font-medium transition-[background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]",
          isOverSky &&
            "bg-white text-zinc-950 hover:bg-blue-50 hover:text-zinc-950 border-transparent shadow-xs"
        )}
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
        overlay ? "fixed top-0 right-0 left-0" : "sticky top-0",
        "z-50 w-full border-b border-transparent transition-colors duration-150",
        scrolled &&
          "border-border bg-white/90 backdrop-blur-md supports-backdrop-filter:bg-white/80 dark:bg-zinc-950/90 dark:supports-backdrop-filter:bg-zinc-950/80",
        className
      )}
      {...props}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        {/* Left: Brand Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            className={cn(
              "inline-flex items-center rounded-lg p-1.5 transition-colors",
              isOverSky
                ? "hover:bg-white/12"
                : "hover:bg-muted dark:hover:bg-muted/50"
            )}
            href={logoHref}
            aria-label="Home"
          >
            {logo ?? (
              <Logo
                iconClassName={
                  isOverSky ? "ring-1 ring-white/30 rounded-[6px]" : undefined
                }
                textClassName={isOverSky ? "text-white" : undefined}
              />
            )}
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center justify-center gap-1.5">
          {links.map((link) => (
            <Button
              key={link.label}
              size="lg"
              variant="ghost"
              className={cn(
                "h-8 rounded-lg px-3 text-[13.5px] font-medium transition-colors",
                isOverSky
                  ? "text-white/90 hover:bg-white/12 hover:text-white"
                  : "text-zinc-600 hover:bg-accent-50 hover:text-accent-600 dark:text-zinc-300 dark:hover:bg-accent-950/60 dark:hover:text-accent-300"
              )}
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
            <ThemeToggle
              collapsed
              className={
                isOverSky
                  ? "text-white/90 hover:bg-white/12 hover:text-white"
                  : undefined
              }
            />
          </div>
          <ThemeToggle
            collapsed
            className={cn(
              "md:hidden",
              isOverSky && "text-white/90 hover:bg-white/12 hover:text-white"
            )}
          />
          <MobileNav
            links={links}
            actions={actions}
            overDarkSurface={isOverSky}
          />
        </div>
      </nav>
    </header>
  );
}
