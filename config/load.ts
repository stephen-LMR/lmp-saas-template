// The app boots from one AppConfig. Anything invalid stops the build with a readable list
// of what is wrong, so a bad config can never reach a preview.
import { AppConfig } from "../contracts/template.js";

export class AppConfigError extends Error {
  constructor(public readonly problems: string[]) {
    super(`app.config.json is not a valid AppConfig:\n- ${problems.join("\n- ")}`);
    this.name = "AppConfigError";
  }
}

export function parseAppConfig(raw: unknown): AppConfig {
  const result = AppConfig.safeParse(raw);
  if (result.success) return result.data;
  throw new AppConfigError(
    result.error.issues.map(i => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
  );
}
