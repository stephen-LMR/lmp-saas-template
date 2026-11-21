import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig, modules, theme } from "@/config/index";
import { PublicShell } from "@/patterns/public-shell";

export default function HomePage() {
  const canBook = modules.enabled.includes("booking");
  return (
    <PublicShell merchantName={appConfig.merchant_name} logoUrl={theme.logo_url}
      nav={<Button asChild variant="ghost" size="sm"><Link href="/sign-in">Staff sign in</Link></Button>}>
      <section className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6 md:p-12">
        <h1 className="text-2xl font-semibold">{appConfig.merchant_name}</h1>
        <p className="text-lg text-muted-foreground">{canBook ? "Book your next visit online in under a minute." : "Welcome."}</p>
        {canBook ? <Button asChild size="lg"><Link href="/book">Book a visit</Link></Button> : null}
      </section>
    </PublicShell>
  );
}
