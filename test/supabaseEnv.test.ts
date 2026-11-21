import { describe, expect, it } from "vitest";
import { MissingEnvError, supabaseEnv } from "../lib/supabase/env";

describe("supabase env", () => {
  it("returns the url and key when both are set", () => {
    expect(supabaseEnv("https://example.supabase.co", "anon")).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "anon"
    });
  });

  it("names every missing variable", () => {
    try {
      supabaseEnv("", undefined);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(MissingEnvError);
      expect((e as MissingEnvError).missing).toEqual(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]);
    }
  });
});
