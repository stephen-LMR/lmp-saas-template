import raw from "../app.config.json" with { type: "json" };
import { parseAppConfig } from "./load.js";

export const appConfig = parseAppConfig(raw);
