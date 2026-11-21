import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { appConfig, theme } from "@/config/index";
import { isDemo, staffStore } from "@/data/index";
import { MerchantMark } from "@/components/ui/merchant-mark";
import { SignInForm } from "./form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const LINK_PROBLEMS: Record<string, string> = {
  invalid: "That sign-in link is not valid. Ask for a new one below.",
  expired: "That sign-in link has expired or was already used. Ask for a new one below."
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  if (await staffStore()) redirect("/dashboard");
  const { link } = await searchParams;
  const problem = link ? LINK_PROBLEMS[link] : undefined;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-content flex-col items-center justify-center p-4">
      <Card className="w-full md:w-1/2 xl:w-1/3">
        <CardHeader className="items-center text-center">
          <MerchantMark name={appConfig.merchant_name} logoUrl={theme.logo_url} />
          <h1 className="text-xl font-semibold">Sign in to {appConfig.merchant_name}</h1>
          <CardDescription>For the owner and staff.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {problem ? <Alert variant="warning"><AlertDescription>{problem}</AlertDescription></Alert> : null}
          <SignInForm demo={isDemo()} />
        </CardContent>
      </Card>
    </main>
  );
}
