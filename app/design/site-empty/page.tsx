import { parseSiteImages } from "@/config/images";
import { SamplePublicPage } from "../site/content";

// The public page for a merchant who gave no photos at all.
export default function SiteWithoutPhotos() {
  return <SamplePublicPage images={parseSiteImages({})} />;
}
