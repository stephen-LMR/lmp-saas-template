import type { ReactNode } from "react";
import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Title, one line of context, the screen's one primary action, and the "?" link to its help article.
export function PageHeader({
  title, description, action, helpHref
}: { title: string; description?: string; action?: ReactNode; helpHref?: string }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {helpHref ? (
          <Button asChild variant="ghost" size="icon">
            <Link href={helpHref} aria-label="Help for this page">
              <CircleHelp aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
