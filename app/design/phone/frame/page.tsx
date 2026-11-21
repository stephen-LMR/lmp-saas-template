import { notFound } from "next/navigation";
import { PhoneClip, PhoneStill } from "@/components/ui/phone-frame";

// Used only by scripts/capture.mjs, which puts a captured clip or still inside the phone
// frame and records the result. It accepts capture files only, never another address.
const CAPTURE_PATH = /^\/__capture\/[a-z0-9-]+\/(clip\.webm|still\.png)$/;

export default async function CaptureFrame({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const still = one(q.still);
  const clip = one(q.clip);
  const alt = one(q.alt).slice(0, 160) || "The app on a phone";
  if (!CAPTURE_PATH.test(still) || (clip !== "" && !CAPTURE_PATH.test(clip))) notFound();
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <h1 className="sr-only">Phone frame capture</h1>
      {clip ? <PhoneClip clip={clip} still={still} alt={alt} /> : <PhoneStill src={still} alt={alt} />}
    </main>
  );
}
