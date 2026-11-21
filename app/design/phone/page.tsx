import { PhoneStill } from "@/components/ui/phone-frame";

export default function PhoneFrameSample() {
  return (
    <main className="mx-auto flex max-w-content flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Phone frame</h1>
        <p className="text-muted-foreground">Shows a still picture or a short looping clip of the app at phone width.</p>
      </header>
      <PhoneStill src="/design-samples/phone-still.png" alt="The booking page on a phone, with 3:00 PM chosen" className="mx-auto" />
    </main>
  );
}
