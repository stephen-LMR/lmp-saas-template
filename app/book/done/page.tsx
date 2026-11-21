import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { appConfig, theme } from "@/config/index";
import { publicStore } from "@/data/index";
import { formatDay, formatTime } from "@/lib/format";
import { isDate, isTime } from "@/modules/forms";
import { PublicShell } from "@/patterns/public-shell";

export const metadata: Metadata = { title: "You are booked", robots: { index: false } };

export default async function BookedPage({ searchParams }: { searchParams: Promise<{ service?: string; date?: string; time?: string }> }) {
  const q = await searchParams;
  const service = (await publicStore().services()).find(s => s.id === q.service);
  const when = isDate(q.date) && isTime(q.time) ? `${formatDay(q.date)} at ${formatTime(q.time)}` : null;
  return (
    <PublicShell merchantName={appConfig.merchant_name} logoUrl={theme.logo_url}>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CircleCheck aria-hidden className="size-8 text-success" />
          <h1 className="text-xl font-semibold md:text-2xl">You are booked</h1>
          {service && when ? <p className="text-lg">{service.name}, {when}</p> : null}
          <p className="text-muted-foreground">See you then. To change or cancel, please call us.</p>
          <Button asChild variant="outline"><Link href="/book">Book another visit</Link></Button>
        </CardContent>
      </Card>
    </PublicShell>
  );
}
