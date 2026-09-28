"use client";

import {
  isValidElement,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";
import { RiCloseLine, RiLoader4Line } from "@remixicon/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog";
import { Button as BoardButton } from "../base/buttons/button";
import { cn } from "../../lib/utils";

export type ActionDialogSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type ActionDialogIconVariant =
  | "default"
  | "destructive"
  | "warning"
  | "info"
  | "success";

export type ActionDialogButtonVariant = ComponentProps<
  typeof BoardButton
>["variant"];

export interface ActionDialogProps {
  /** Controlled open state. */
  open: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Dialog heading title. */
  title: ReactNode;
  /** Optional subtitle or description text. */
  description?: ReactNode;
  /** Optional icon to render alongside the title or in an icon badge. */
  icon?:
    | ComponentType<{
        className?: string;
        "aria-hidden"?: boolean | "true" | "false";
      }>
    | ReactNode;
  /** Visual variant tone for the icon badge container. */
  iconVariant?: ActionDialogIconVariant;
  /** Dialog content body (for forms, info text, custom cards). */
  children?: ReactNode;
  /** Max width sizing preset. Defaults to "md". */
  size?: ActionDialogSize;
  /** Text or element for the confirm action button. Pass `false` or `null` to omit. Defaults to "Confirm". */
  confirmText?: ReactNode | false;
  /** Text or element for the cancel / secondary button. Pass `false` or `null` to omit. Defaults to "Cancel". */
  cancelText?: ReactNode | false;
  /** Visual button style for the confirm button. Defaults to "primary". */
  confirmVariant?: ActionDialogButtonVariant;
  /** Visual button style for the cancel button. Defaults to "secondary". */
  cancelVariant?: ActionDialogButtonVariant;
  /**
   * Handler fired when the confirm button is pressed. Supports async promises with auto-loading tracking.
   * If onConfirm throws, loading is reset but the rejection should be handled/toasted by the caller.
   * If omitted (e.g. for info dialogs), clicking the confirm/close button simply closes the dialog.
   */
  onConfirm?: () => void | Promise<void>;
  /** Handler fired when the cancel button or dismiss action is triggered. */
  onCancel?: () => void;
  /** Explicit loading state flag (e.g. from react-query `isPending`). */
  isLoading?: boolean;
  /** Custom label to show during loading state (e.g. "Deleting...", "Saving..."). */
  loadingText?: ReactNode;
  /** Disable the confirm action button. */
  confirmDisabled?: boolean;
  /** Disable the cancel button. */
  cancelDisabled?: boolean;
  /** Whether to show the top-right X close button. Defaults to `true`. */
  showCloseButton?: boolean;
  /** Prevent closing when clicking outside or pressing Escape while loading. Defaults to `true`. */
  preventCloseWhenBusy?: boolean;
  /** Whether to show divider borders between header, body, and footer. Defaults to true when `children` are present, false otherwise. */
  divided?: boolean;
  /** Completely custom footer override. Replaces standard cancel/confirm buttons when provided. Pass null/false to hide. */
  footer?: ReactNode;
  /** Optional custom CSS classes for the outer dialog content wrapper. */
  className?: string;
  /** Optional custom CSS classes for the dialog header. */
  headerClassName?: string;
  /** Optional custom CSS classes for the dialog body. */
  bodyClassName?: string;
  /** Optional custom CSS classes for the dialog footer. */
  footerClassName?: string;
}

const SIZE_CLASSES: Record<ActionDialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

const ICON_VARIANT_CLASSES: Record<ActionDialogIconVariant, string> = {
  default:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60",
  destructive:
    "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200/80 dark:border-red-900/50",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/50",
  info: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/50",
  success:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/50",
};

/**
 * Reusable modal dialogue component supporting:
 * - Delete / Confirmation dialogues (destructive button, warning badge, loading states)
 * - Information dialogues (info badge, custom content, single close button)
 * - Add / Form dialogues (form body, inputs, submit action)
 */
export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: IconProp,
  iconVariant = "default",
  children,
  size = "md",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  cancelVariant = "secondary",
  onConfirm,
  onCancel,
  isLoading,
  loadingText,
  confirmDisabled = false,
  cancelDisabled = false,
  showCloseButton = true,
  preventCloseWhenBusy = true,
  divided,
  footer,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}: ActionDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = Boolean(isLoading) || internalLoading;
  const isDivided = divided ?? Boolean(children);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isBusy && preventCloseWhenBusy) return;
    if (!nextOpen) {
      onCancel?.();
    }
    onOpenChange(nextOpen);
  };

  const handleCancel = () => {
    if (isBusy && preventCloseWhenBusy) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (isBusy || confirmDisabled) return;
    // When no custom onConfirm is provided (e.g. an info dialog with a single "Close" button), close the dialog.
    if (!onConfirm) {
      onOpenChange(false);
      return;
    }
    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const renderIcon = () => {
    if (!IconProp) return null;
    const IconComponent = IconProp as ComponentType<{
      className?: string;
      "aria-hidden"?: boolean | "true" | "false";
    }>;
    return (
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          ICON_VARIANT_CLASSES[iconVariant]
        )}
      >
        {isValidElement(IconProp) ? (
          IconProp
        ) : (
          <IconComponent className="size-4.5" aria-hidden />
        )}
      </div>
    );
  };

  const hasButtons =
    (confirmText !== false && confirmText !== null) ||
    (cancelText !== false && cancelText !== null);
  const showFooter = footer === undefined ? hasButtons : Boolean(footer);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        {...(!description && { "aria-describedby": undefined })}
        className={cn(
          "w-full rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xl outline-none",
          "dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
          SIZE_CLASSES[size],
          className
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-start justify-between gap-3",
            isDivided &&
              "border-b border-zinc-200/80 pb-3 dark:border-zinc-800",
            headerClassName
          )}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {renderIcon()}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <DialogTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>

          {showCloseButton && (
            <BoardButton
              variant="ghost"
              size="small"
              iconOnly
              aria-label="Close dialog"
              onClick={handleCancel}
              disabled={isBusy && preventCloseWhenBusy}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0 -mr-1.5 -mt-1"
            >
              <RiCloseLine className="size-4" />
            </BoardButton>
          )}
        </div>

        {/* Body content */}
        {children && (
          <div className={cn("py-3 text-xs", bodyClassName)}>{children}</div>
        )}

        {/* Footer */}
        {showFooter && (
          <div
            className={cn(
              "flex items-center justify-end gap-2",
              isDivided
                ? "mt-2 border-t border-zinc-200/80 pt-3 dark:border-zinc-800"
                : "mt-5",
              footerClassName
            )}
          >
            {footer !== undefined ? (
              footer
            ) : (
              <>
                {cancelText !== false && cancelText !== null && (
                  <BoardButton
                    variant={cancelVariant}
                    size="small"
                    type="button"
                    onClick={handleCancel}
                    disabled={
                      cancelDisabled || (isBusy && preventCloseWhenBusy)
                    }
                  >
                    {cancelText}
                  </BoardButton>
                )}

                {confirmText !== false && confirmText !== null && (
                  <BoardButton
                    variant={confirmVariant}
                    size="small"
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirmDisabled || isBusy}
                  >
                    {isBusy && (
                      <RiLoader4Line
                        className="size-3.5 animate-spin"
                        aria-hidden
                      />
                    )}
                    <span>
                      {isBusy && loadingText ? loadingText : confirmText}
                    </span>
                  </BoardButton>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Convenient alias for ActionDialog when used specifically for confirmations.
 */
export const ConfirmDialog = ActionDialog;
