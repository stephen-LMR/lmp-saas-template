import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col items-start justify-center gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">Page not found</h1>
        <p className="text-muted-foreground">That page does not exist or has moved.</p>
      </div>
      <Button asChild>
        <Link href="/">Go to home page</Link>
      </Button>
    </main>
  );
}
