"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { RiMailCheckLine } from "@remixicon/react";
import { Button } from "../../base/buttons/button";
import { Divider } from "../../base/divider/divider";
import { Input } from "../../base/input/input";
import { InputOtp } from "../../base/input-otp/input-otp";
import { LinkButton } from "../../base/buttons/link-button";
import { SocialButton } from "../../base/social-button/social-button";
import type { SocialProvider } from "../../base/social-button/social-providers";
import { cx } from "../../../utils/cx";

// Re-exported so `media` has a batteries-included option and the registry
// installs it alongside the card. Nothing here imports it otherwise.
export { AuthMediaCarousel, type AuthMediaSlide } from "./auth-media-carousel";

/**
 * Sign-in and sign-up cards built on the social buttons.
 *
 * The providers render one of three ways, because each is right somewhere:
 *
 *   layout="stacked"  full-width buttons with labels, one per row. Names each
 *                     provider, so it suits a dedicated sign-in page with the
 *                     room to spell them out.
 *   layout="inline"   icon-only squares side by side. Compact enough for a
 *                     modal or a narrow panel, and carries more providers in
 *                     the same space.
 *   layout="grid"     icon-only across equal columns, so a small set reads as
 *                     one row of controls rather than loose squares.
 *
 * All three sit below the email form, never above it, and all three take the
 * same `providers` array, so switching is one prop and the set never has to
 * be written twice.
 *
 * `media` turns the whole thing into a two-column split with artwork beside
 * the form — pass `AuthMediaCarousel` for a set of images that cycles on its
 * own — and `logo` puts a mark above the title.
 *
 * `mode="verify"` is the step after either one: OTP boxes instead of email
 * and password, a resend action instead of a link to the other mode, and no
 * providers at all, since the visitor has already chosen how they sign in.
 *
 * The form is deliberately uncontrolled and `onSubmit`-based: an auth card is
 * the shell around whatever the host app's auth library does, not an opinion
 * about it. Pass `onSubmit` and `onProvider`, or swap the CTA for your own.
 */

export type AuthLayout = "stacked" | "inline" | "grid";
export type AuthMode = "signin" | "signup" | "verify";

export interface AuthCardProps {
  /**
   * `signin` (default), `signup`, or `verify` for the one-time-code step.
   * `verify` swaps the email fields for OTP boxes and drops the providers:
   * the visitor has already chosen how they are signing in.
   */
  mode?: AuthMode;
  /** `verify` only: the address the code went to, shown in the description. */
  email?: string;
  /** `verify` only: how many digits. Defaults to 6. */
  codeLength?: number;
  /** `verify` only: fires once the last box is filled. */
  onComplete?: (code: string) => void;
  /** `verify` only: the resend action. */
  onResend?: () => void;
  /** How the provider buttons are arranged. Defaults to `stacked`. */
  layout?: AuthLayout;
  providers?: SocialProvider[];
  title?: ReactNode;
  description?: ReactNode;
  /**
   * Artwork for the right half. Passing it turns the card into the split
   * layout: form on the left, media on the right, which drops to the form
   * alone below `md` rather than stacking a tall image above the fields.
   */
  media?: ReactNode;
  /**
   * Mark above the title — a wordmark, an app icon, anything. Deliberately a
   * node rather than a src, so the card stays brand-agnostic and an installed
   * copy pulls none of BoardUI's own artwork with it.
   */
  logo?: ReactNode;
  /** Centre the heading, as the split layout usually wants. */
  centered?: boolean;
  /** Sign-up only: adds a stacked confirm-password field. */
  confirmPassword?: boolean;
  /** Small print under the card, outside its border. */
  footnote?: ReactNode;
  /** Fires with the form's own FormData; wire it to your auth library. */
  onSubmit?: (data: FormData) => void;
  onProvider?: (provider: SocialProvider) => void;
  /** Disables auth controls while the host app is submitting the form. */
  isSubmitting?: boolean;
  /** Footer link target, e.g. to the opposite mode. */
  switchHref?: string;
  /** Sign-in only: destination for the forgot-password action. */
  forgotPasswordHref?: string;
  className?: string;
}

const COPY = {
  signin: {
    title: "Log in to Outbox",
    description: "Sign in to access your knowledge base and assistants.",
    cta: "Log in",
    switchLead: "Don't have an account?",
    switchAction: "Sign up",
  },
  signup: {
    title: "Create your account",
    description: "Start searching, organizing, and indexing your documents.",
    cta: "Create account",
    switchLead: "Already have an account?",
    switchAction: "Sign in",
  },
  verify: {
    title: "Check your inbox",
    description: "Enter the code we sent to finish signing in.",
    cta: "Verify and continue",
    switchLead: "Code not arriving?",
    switchAction: "Send a new one",
  },
} as const;

const AUTH_FIELD_CLASS =
  "border border-border-button-default bg-background-primary-default shadow-2xs";

export function AuthCard({
  mode = "signin",
  email,
  codeLength = 6,
  onComplete,
  onResend,
  layout = "stacked",
  providers = ["google", "apple", "github"],
  title,
  description,
  media,
  logo,
  centered = false,
  confirmPassword = false,
  footnote,
  onSubmit,
  onProvider,
  isSubmitting = false,
  switchHref = "#",
  forgotPasswordHref = "#",
  className,
}: AuthCardProps) {
  const [code, setCode] = useState("");
  const copy = COPY[mode];
  const signup = mode === "signup";
  const verify = mode === "verify";
  const hasSocial = !verify && providers.length > 0;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(new FormData(event.currentTarget));
  };

  const social = (
    <div
      className={cx(
        layout === "stacked" && "flex flex-col gap-2.5",
        // Wraps rather than scrolls: six providers on a narrow card should
        // fall to a second row, not clip.
        layout === "inline" && "flex flex-wrap justify-center gap-2",
        // Equal columns that share the full width, so three providers read as
        // one row of controls rather than three loose squares.
        layout === "grid" && "grid grid-flow-col auto-cols-fr gap-2.5"
      )}
    >
      {providers.map((provider) => (
        <SocialButton
          key={provider}
          brand={provider}
          appearance="white"
          iconOnly={layout !== "stacked"}
          fullWidth={layout === "stacked"}
          // `iconOnly` fixes a square width; the grid needs it to stretch,
          // and `className` is last into `cx` so it wins.
          className={layout === "grid" ? "w-full" : undefined}
          disabled={isSubmitting}
          onClick={() => onProvider?.(provider)}
        />
      ))}
    </div>
  );

  const centerContent = centered;
  const mark =
    logo ??
    (verify ? (
      <RiMailCheckLine
        className="size-8 text-foreground-icon-primary"
        aria-hidden
      />
    ) : null);

  const body = (
    <>
      {mark ? (
        <div
          className={cx(
            "mb-4 flex",
            centerContent ? "justify-center" : "justify-start"
          )}
        >
          {mark}
        </div>
      ) : null}

      <div
        className={cx("flex flex-col gap-1", centerContent && "text-center")}
      >
        <h1 className="text-title-1-semibold tracking-tight text-text-primary">
          {title ?? copy.title}
        </h1>
        <p className="text-body-regular text-text-secondary">
          {description ??
            (verify && email ? (
              <>
                Enter the code we sent to{" "}
                <span className="text-body-medium text-text-primary">
                  {email}
                </span>{" "}
                to finish signing in.
              </>
            ) : (
              copy.description
            ))}
        </p>
      </div>

      {hasSocial ? (
        <div className="mt-6">
          {social}
          <div className="my-5">
            <Divider contentClassName="text-caption-1-regular text-text-tertiary">
              or use email
            </Divider>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className={cx(hasSocial ? "mt-0" : "mt-6", "flex flex-col gap-3.5")}
        aria-busy={isSubmitting}
      >
        {verify ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-body-medium text-text-secondary">
              Verification code
            </span>
            <InputOtp
              value={code}
              onChange={setCode}
              onComplete={onComplete}
              length={codeLength}
              groupEvery={codeLength % 2 === 0 ? codeLength / 2 : undefined}
              aria-label="Verification code"
              className="justify-start"
            />
          </div>
        ) : null}

        {signup ? (
          <Input
            name="name"
            label="Full name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            fieldClassName={AUTH_FIELD_CLASS}
          />
        ) : null}

        {verify ? null : (
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete={signup ? "email" : "username"}
            fieldClassName={AUTH_FIELD_CLASS}
            isRequired
          />
        )}

        {verify ? null : signup && confirmPassword ? (
          <>
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="At least 12 characters"
              autoComplete="new-password"
              fieldClassName={AUTH_FIELD_CLASS}
              isRequired
            />
            <Input
              name="confirmPassword"
              type="password"
              label="Confirm password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              fieldClassName={AUTH_FIELD_CLASS}
              isRequired
            />
          </>
        ) : (
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder={
              signup ? "At least 12 characters" : "Enter your password"
            }
            autoComplete={signup ? "new-password" : "current-password"}
            fieldClassName={AUTH_FIELD_CLASS}
            isRequired
          />
        )}

        <Button type="submit" className="mt-1.5 w-full" disabled={isSubmitting}>
          {copy.cta}
        </Button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2.5 text-center">
        {!signup && !verify ? (
          <LinkButton
            href={forgotPasswordHref}
            variant="secondary"
            size="small"
            disabled={isSubmitting}
          >
            Forgot your password?
          </LinkButton>
        ) : null}

        {verify ? (
          <p className="text-body-2-regular text-text-secondary">
            {copy.switchLead}{" "}
            <LinkButton size="small" onClick={onResend}>
              {copy.switchAction}
            </LinkButton>
          </p>
        ) : (
          <p className="text-body-2-regular text-text-secondary">
            {copy.switchLead}{" "}
            <LinkButton href={switchHref} size="small" disabled={isSubmitting}>
              {copy.switchAction}
            </LinkButton>
          </p>
        )}
      </div>
    </>
  );

  const card = media ? (
    <div
      className={cx(
        "grid w-full max-w-[960px] overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default shadow-xs md:grid-cols-2 dark:bg-background-secondary-default",
        className
      )}
    >
      <div className="flex flex-col justify-center p-6 sm:p-10">{body}</div>
      <div className="relative hidden bg-background-secondary-default md:block">
        {media}
      </div>
    </div>
  ) : (
    <div className={cx("flex w-full max-w-[380px] flex-col", className)}>
      {body}
    </div>
  );

  if (!footnote) return card;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {card}
      <p className="max-w-[520px] text-center text-caption-1-regular text-text-tertiary">
        {footnote}
      </p>
    </div>
  );
}
