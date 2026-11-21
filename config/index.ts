import raw from "../app.config.json" with { type: "json" };
import { resolveTheme } from "../design/theme";
import { resolveModules } from "../modules/registry";
import { parseAppConfig } from "./load";

// Everything is checked at boot, so a bad config, an unapproved theme, or a module that
// cannot be built stops the build instead of reaching a preview.
export const appConfig = parseAppConfig(raw);
export const theme = resolveTheme(appConfig.theme);
export const modules = resolveModules(appConfig);
