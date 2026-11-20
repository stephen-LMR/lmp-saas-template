"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col items-start justify-center gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">Something went wrong</h1>
        <p className="text-muted-foreground">Please try again. If it keeps happening, contact us.</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
