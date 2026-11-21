import { CircleAlert } from "lucide-react";

// A problem with the whole form, shown above its buttons.
function FormMessage({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-center gap-2 rounded-sm border border-danger bg-card p-3 text-sm font-medium text-danger">
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      {children}
    </p>
  );
}

export { FormMessage };
