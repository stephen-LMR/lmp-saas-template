"use client";

import * as React from "react";
import { ImageIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// A place for one of the merchant's own photos. The box keeps its shape while the photo
// loads, so nothing on the page jumps. With no photo, or a photo that fails to load, it
// shows a quiet placeholder instead of a broken picture.
const RATIOS = { wide: "aspect-video", landscape: "aspect-4/3", square: "aspect-square" } as const;

export type SlotImage = { src: string; alt: string };

function ImageSlot({
  image, ratio = "landscape", priority = false, icon: Icon = ImageIcon, className
}: {
  image: SlotImage | null;
  ratio?: keyof typeof RATIOS;
  // True for the one picture at the top of a page, so it loads first.
  priority?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const failed = image !== null && failedSrc === image.src;
  // A photo can fail before the page becomes interactive, when no error handler is
  // listening yet. So also look at the picture once on arrival.
  const imgRef = React.useRef<HTMLImageElement>(null);
  const src = image?.src ?? null;
  React.useEffect(() => {
    const el = imgRef.current;
    if (el && src && el.complete && el.naturalWidth === 0) setFailedSrc(src);
  }, [src]);
  const frame = cn("relative w-full overflow-hidden rounded-lg bg-muted", RATIOS[ratio], className);

  if (!image || failed) {
    return (
      <div
        data-slot="image-slot"
        data-state={failed ? "failed" : "empty"}
        // An empty slot says nothing. A photo that failed still passes on its description.
        {...(image && failed ? { role: "img", "aria-label": image.alt } : { "aria-hidden": true })}
        className={cn(frame, "flex items-center justify-center text-muted-foreground")}
      >
        <Icon aria-hidden className="size-8" />
      </div>
    );
  }
  return (
    <div data-slot="image-slot" data-state="filled" className={frame}>
      {/* eslint-disable-next-line @next/next/no-img-element -- merchant photos come from any host */}
      <img
        ref={imgRef}
        src={image.src}
        alt={image.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onError={() => setFailedSrc(image.src)}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}

export { ImageSlot };
