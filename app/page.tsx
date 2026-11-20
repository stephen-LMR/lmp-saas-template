import { appConfig } from "@/config/index";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center gap-2 p-4 md:p-8">
      <h1 className="text-xl font-semibold md:text-2xl">{appConfig.merchant_name}</h1>
      <p className="text-muted-foreground">Your app is being set up.</p>
    </main>
  );
}
