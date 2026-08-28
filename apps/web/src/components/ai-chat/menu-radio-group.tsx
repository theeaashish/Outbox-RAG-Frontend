import { cn } from "@repo/ui";
import { Radio } from "./menu-items";

interface MenuRadioGroupProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Radio rows for popover menus. Selection state lives on aria-checked;
 * visual selection is secondary styling. (Arrow-key nav: adopt a real
 * RadioGroup primitive as a follow-up.)
 */
export function MenuRadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: MenuRadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex flex-col gap-0.5", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none dark:text-zinc-100 dark:hover:bg-zinc-800/70 dark:focus-visible:bg-zinc-800/70",
              selected && "bg-zinc-100 font-medium dark:bg-zinc-800/80"
            )}
          >
            <span>{option.label}</span>
            <Radio checked={selected} />
          </button>
        );
      })}
    </div>
  );
}
