import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageSlot, type SlotImage } from "@/components/ui/image-slot";

// Sections of the pages a merchant's customers see first: hero, services, gallery, about.
// Each takes the merchant's own photos. With no photo the section closes up into a clean
// text layout, so an app with zero pictures still looks finished.

export function SiteHero({
  title, text, action, image
}: { title: string; text: string; action?: ReactNode; image: SlotImage | null }) {
  const copy = (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-lg text-muted-foreground">{text}</p>
      {action}
    </div>
  );
  if (!image) {
    return <section data-section="hero" className="rounded-lg border bg-card p-6 md:p-12">{copy}</section>;
  }
  return (
    <section data-section="hero" className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
      {copy}
      <ImageSlot image={image} ratio="landscape" priority />
    </section>
  );
}

export type ServiceCardItem = { id: string; name: string; description: string; detail: string; image: SlotImage | null };

export function ServiceCards({ title, services }: { title: string; services: ServiceCardItem[] }) {
  // Pictures show only when at least one service has one, so the cards always line up.
  const withPictures = services.some(s => s.image !== null);
  return (
    <section data-section="services" className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map(s => (
          <li key={s.id} className="min-w-0">
            <Card className="flex h-full flex-col overflow-hidden">
              {withPictures ? <ImageSlot image={s.image} ratio="wide" className="rounded-none" /> : null}
              <CardHeader>
                <CardTitle className="text-lg">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <p className="text-sm text-muted-foreground">{s.description}</p>
                <p className="mt-auto text-sm font-medium">{s.detail}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Shows nothing at all when the merchant has no gallery photos.
export function Gallery({ title, images }: { title: string; images: SlotImage[] }) {
  if (images.length === 0) return null;
  return (
    <section data-section="gallery" className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
        {images.map(img => (
          <li key={img.src} className="min-w-0">
            <ImageSlot image={img} ratio="square" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutSection({ title, children, image }: { title: string; children: ReactNode; image: SlotImage | null }) {
  const copy = (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-muted-foreground">{children}</div>
    </div>
  );
  if (!image) return <section data-section="about">{copy}</section>;
  return (
    <section data-section="about" className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
      <ImageSlot image={image} ratio="landscape" />
      {copy}
    </section>
  );
}
