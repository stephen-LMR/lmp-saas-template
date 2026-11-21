import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A phone outline around something captured at phone width (375 px): a still picture or a
// short looping clip of the app in use. The frame shrinks to fit narrow screens.
function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-slot="phone-frame" className={cn("w-fit max-w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3 shadow-lg", className)}>
      <div aria-hidden className="mx-auto mb-3 h-1 w-12 rounded-full bg-neutral-700" />
      <div data-slot="phone-screen" className="relative aspect-375/812 w-phone max-w-full overflow-hidden rounded-sm bg-background">
        {children}
      </div>
    </div>
  );
}

const fill = "absolute inset-0 size-full object-cover object-top";

// A still picture of the app. The description is required.
function PhoneStill({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <PhoneFrame className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- captured files, not page content */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className={fill} />
    </PhoneFrame>
  );
}

// A short clip that plays silently on repeat. People who ask their device for less motion
// get the still picture instead.
function PhoneClip({ clip, still, alt, className }: { clip: string; still: string; alt: string; className?: string }) {
  return (
    <PhoneFrame className={className}>
      <video
        src={clip}
        poster={still}
        aria-label={alt}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className={cn(fill, "motion-reduce:hidden")}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- captured files, not page content */}
      <img src={still} alt={alt} loading="lazy" decoding="async" className={cn(fill, "hidden motion-reduce:block")} />
    </PhoneFrame>
  );
}

export { PhoneClip, PhoneFrame, PhoneStill };
