import { parseSiteImages } from "@/config/images";
import { SamplePublicPage } from "./content";

// Stand-in pictures for this sample screen only. A merchant app shows the merchant's own photos.
const sample = parseSiteImages({
  hero: { src: "/design-samples/hero.svg", alt: "A small dog on a grooming table, freshly brushed" },
  about: { src: "/design-samples/about.svg", alt: "The shop front with its yellow awning" },
  gallery: [
    { src: "/design-samples/gallery-1.svg", alt: "A poodle after a full groom" },
    { src: "/design-samples/gallery-2.svg", alt: "Two terriers waiting by the front desk" },
    { src: "/design-samples/gallery-3.svg", alt: "A retriever shaking off after a bath" }
  ],
  services: {
    "Full groom": { src: "/design-samples/service-1.svg", alt: "A groomer trimming a spaniel" },
    "Bath and brush": { src: "/design-samples/service-2.svg", alt: "A dog being towel dried" }
    // Nail trim has no photo on purpose, to show the placeholder next to real pictures.
  }
});

export default function SiteWithPhotos() {
  return <SamplePublicPage images={sample} logoUrl="/design-samples/logo.svg" />;
}
