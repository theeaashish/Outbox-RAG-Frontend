export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl bg-zinc-100/90 px-4 py-3 text-xs leading-relaxed text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        {children}
      </p>
    </div>
  );
}
