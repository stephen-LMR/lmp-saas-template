// The merchant's own photos. The build agent fills src/custom/images.json; the template
// never ships stock photos. Every slot is optional and every picture must describe itself
// (alt text), so a screen reader user gets the same information as everyone else.
import { z } from "zod";

const looksLikeFileName = (s: string) =>
  /\.(jpe?g|png|webp|gif|avif|heic|svg)$/i.test(s) || /^(img|dsc|image|photo|picture|pic|untitled)[\s_-]*\d*$/i.test(s);

export const SiteImage = z.strictObject({
  // A path inside the app ("/photos/front.jpg") or a secure web address.
  src: z.string().refine(s => /^\/(?!\/)/.test(s) || /^https:\/\/\S+$/.test(s), {
    message: 'must start with "/" or "https://"'
  }),
  alt: z
    .string()
    .trim()
    .min(3, "alt text is required: say what the picture shows")
    .max(160, "alt text must be 160 characters or fewer")
    .refine(s => !looksLikeFileName(s), { message: "alt text must describe the picture, not repeat a file name" })
    .refine(s => !/[–—]/.test(s), { message: "use a plain hyphen, not a long dash" })
});
export type SiteImage = z.infer<typeof SiteImage>;

export const MAX_GALLERY_IMAGES = 12;

export const SiteImages = z.strictObject({
  hero: SiteImage.nullable().default(null),
  about: SiteImage.nullable().default(null),
  gallery: z.array(SiteImage).max(MAX_GALLERY_IMAGES).default([]),
  // Keyed by service name. Matching ignores upper and lower case and outer spaces.
  services: z.record(z.string().min(1), SiteImage).default({})
});
export type SiteImages = z.infer<typeof SiteImages>;

export class SiteImagesError extends Error {
  constructor(public readonly problems: string[]) {
    super(`src/custom/images.json is not valid:\n- ${problems.join("\n- ")}`);
    this.name = "SiteImagesError";
  }
}

export function parseSiteImages(raw: unknown): SiteImages {
  const result = SiteImages.safeParse(raw);
  if (result.success) return result.data;
  throw new SiteImagesError(result.error.issues.map(i => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message)));
}

const norm = (s: string) => s.trim().toLowerCase();

// The photo for one service, or null when the merchant gave none.
export function serviceImage(images: SiteImages, serviceName: string): SiteImage | null {
  const hit = Object.entries(images.services).find(([name]) => norm(name) === norm(serviceName));
  return hit ? hit[1] : null;
}
