import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SiteImages } from "@/config/images";
import { serviceImage } from "@/config/images";
import { appConfig } from "@/config/index";
import { formatDuration, formatMoney } from "@/lib/format";
import { PublicShell } from "@/patterns/public-shell";
import { AboutSection, Gallery, ServiceCards, SiteHero } from "@/patterns/site";

const SERVICES = [
  { id: "s1", name: "Full groom", description: "Bath, haircut, nails, and ears.", cents: 8500, minutes: 90 },
  { id: "s2", name: "Bath and brush", description: "A wash, blow dry, and brush out.", cents: 4500, minutes: 45 },
  { id: "s3", name: "Nail trim", description: "Quick trim and file. No appointment gaps.", cents: 1500, minutes: 15 }
];

// The same page with and without photos, so both looks are checked by the design gates.
export function SamplePublicPage({ images, logoUrl = null }: { images: SiteImages; logoUrl?: string | null }) {
  return (
    <PublicShell merchantName={appConfig.merchant_name} logoUrl={logoUrl}>
      <SiteHero
        title="Grooming your dog will love"
        text="Gentle, unhurried appointments with the same groomer every visit."
        image={images.hero}
        action={<Button asChild size="lg"><Link href="/design/booking">Book a visit</Link></Button>}
      />
      <ServiceCards
        title="Services"
        services={SERVICES.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          detail: `${formatMoney(s.cents)} · ${formatDuration(s.minutes)}`,
          image: serviceImage(images, s.name)
        }))}
      />
      <Gallery title="Recent visits" images={images.gallery} />
      <AboutSection title="About us" image={images.about}>
        <p>We opened in 2014 with one table and one rule: no dog is rushed.</p>
        <p>Today three groomers look after more than 400 regulars.</p>
      </AboutSection>
    </PublicShell>
  );
}
