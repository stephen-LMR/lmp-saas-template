"use client";

import * as React from "react";

// The merchant's logo in the top bar. With no logo, or one that fails to load, it shows a
// square in the brand color with the first letter of the name.
function MerchantMark({ name, logoUrl = null }: { name: string; logoUrl?: string | null }) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLImageElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (el && logoUrl && el.complete && el.naturalWidth === 0) setFailedSrc(logoUrl);
  }, [logoUrl]);

  if (logoUrl && failedSrc !== logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- merchant logos come from any host
      <img
        ref={ref}
        data-slot="merchant-mark"
        src={logoUrl}
        alt={`${name} logo`}
        decoding="async"
        onError={() => setFailedSrc(logoUrl)}
        className="size-8 shrink-0 rounded-sm object-contain"
      />
    );
  }
  return (
    <span data-slot="merchant-mark" aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export { MerchantMark };
