// Components - UI
export * from "./components/ui/avatar";
export * from "./components/ui/badge";
export * from "./components/ui/button";
export * from "./components/ui/card";
export * from "./components/ui/dialog";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/popover";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/sonner";
export * from "./components/ui/textarea";

// Shared Primitives & Blocks
export * from "./components/logo";
export * from "./components/portal";

// Hooks
export * from "./hooks/use-scroll";
export * from "./hooks/use-media-query";

// Theme Provider
export * from "./components/theme-provider";

// Base Components - BoardUI
export {
  Button as BoardButton,
  ButtonLink as BoardButtonLink,
  type ButtonProps as BoardButtonProps,
  type ButtonLinkProps as BoardButtonLinkProps,
} from "./components/base/buttons/button";
export * from "./components/base/buttons/close-button";
export * from "./components/base/buttons/icon-button";
export * from "./components/base/kbd/kbd";
export {
  Avatar as BoardAvatar,
  type AvatarProps as BoardAvatarProps,
} from "./components/base/avatar/avatar";
export {
  Badge as BoardBadge,
  type BadgeProps as BoardBadgeProps,
} from "./components/base/badges/badge";
export {
  Chip as BoardChip,
  type ChipProps as BoardChipProps,
} from "./components/base/badges/chip";

// Application - Dashboard & Sidebar
export * from "./components/application/dashboard/sidebar-collapsible";
export * from "./components/application/dashboard/template-sidebar";
export * from "./components/application/dashboard/dashboard-team-menu";
export * from "./components/application/dashboard/dashboard-user-menu";
export * from "./components/application/settings/settings-modal";
export * from "./components/application/theme/theme-toggle";

// Utilities
export { cn } from "./lib/utils";
export { cx } from "./utils/cx";
