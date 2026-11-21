import raw from "../app.config.json" with { type: "json" };
import { resolveTheme } from "../design/theme";
import { parseAppConfig } from "./load";

export const appConfig = parseAppConfig(raw);
// Resolved at boot so an unapproved theme stops the build.
export const theme = resolveTheme(appConfig.theme);
