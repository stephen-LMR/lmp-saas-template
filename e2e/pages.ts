// Every sample screen the design gates run against. Add a screen here when a pattern is added.
export const DESIGN_PAGES = [
  { path: "/design", name: "gallery", onePrimary: false },
  { path: "/design/dashboard", name: "dashboard", onePrimary: true },
  { path: "/design/list", name: "list-detail", onePrimary: true },
  { path: "/design/calendar", name: "calendar", onePrimary: true },
  { path: "/design/form", name: "form", onePrimary: true },
  { path: "/design/settings", name: "settings", onePrimary: true },
  { path: "/design/booking", name: "public-booking", onePrimary: true },
  { path: "/design/portal", name: "customer-portal", onePrimary: true },
  { path: "/design/site", name: "site-photos", onePrimary: true },
  { path: "/design/site-empty", name: "site-no-photos", onePrimary: true },
  { path: "/design/phone", name: "phone-frame", onePrimary: true },
  { path: "/design/states", name: "states", onePrimary: true },
  { path: "/no-such-page", name: "not-found", onePrimary: true }
] as const;
