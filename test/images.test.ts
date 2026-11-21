import { describe, expect, it } from "vitest";
import { MAX_GALLERY_IMAGES, parseSiteImages, serviceImage, SiteImagesError } from "../config/images";
import { siteImages } from "../config/index";

const photo = { src: "https://cdn.example.com/front.jpg", alt: "The shop front on a sunny day" };
const problems = (raw: unknown): string[] => {
  try {
    parseSiteImages(raw);
  } catch (e) {
    if (e instanceof SiteImagesError) return e.problems;
    throw e;
  }
  return [];
};

describe("merchant photos", () => {
  it("the template ships with no photos, and that is valid", () => {
    expect(siteImages).toEqual({ hero: null, about: null, gallery: [], services: {} });
  });

  it("an empty file means every slot falls back", () => {
    expect(parseSiteImages({})).toEqual({ hero: null, about: null, gallery: [], services: {} });
  });

  it("accepts photos in every slot", () => {
    const images = parseSiteImages({ hero: photo, about: { src: "/photos/team.jpg", alt: "Our three groomers" }, gallery: [photo], services: { "Full groom": photo } });
    expect(images.hero?.alt).toBe("The shop front on a sunny day");
    expect(images.gallery).toHaveLength(1);
  });

  it("finds a service photo whatever the capital letters or outer spaces", () => {
    const images = parseSiteImages({ services: { "Full Groom ": photo } });
    expect(serviceImage(images, "full groom")).toEqual(photo);
    expect(serviceImage(images, "Nail trim")).toBeNull();
  });

  it.each([
    ["missing", { src: photo.src }],
    ["empty", { ...photo, alt: "  " }],
    ["a file name", { ...photo, alt: "IMG_4032.jpg" }],
    ["a camera default", { ...photo, alt: "image 3" }],
    ["too long", { ...photo, alt: "a".repeat(161) }],
    ["a long dash", { ...photo, alt: "Before — after" }]
  ])("refuses a photo whose alt text is %s", (_label, bad) => {
    expect(problems({ hero: bad }).join(" ")).toMatch(/^hero\.alt/);
    expect(problems({ gallery: [photo, bad] }).join(" ")).toMatch(/^gallery\.1\.alt/);
    expect(problems({ services: { Bath: bad } }).join(" ")).toMatch(/^services\.Bath\.alt/);
  });

  it.each(["http://cdn.example.com/a.jpg", "//cdn.example.com/a.jpg", "javascript:alert(1)", "data:image/png;base64,AAAA", "photos/a.jpg", ""])(
    "refuses the address %s",
    src => {
      expect(problems({ hero: { src, alt: photo.alt } }).join(" ")).toMatch(/^hero\.src/);
    }
  );

  it("refuses more gallery photos than the page is designed for", () => {
    expect(problems({ gallery: Array.from({ length: MAX_GALLERY_IMAGES + 1 }, () => photo) })).toHaveLength(1);
  });

  it("refuses a slot the template does not have", () => {
    expect(problems({ banner: photo }).length).toBeGreaterThan(0);
  });
});
