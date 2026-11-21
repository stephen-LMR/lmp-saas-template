import { describe, expect, it } from "vitest";
import { collectTests, planJobs, slugify } from "../scripts/capture-lib.mjs";

const result = (over: object = {}) => ({
  duration: 3400,
  attachments: [
    { name: "video", path: "/tmp/v.webm", contentType: "video/webm" },
    { name: "screenshot", path: "/tmp/s.png", contentType: "image/png" }
  ],
  ...over
});
const report = (specs: object[]) => ({ suites: [{ file: "tests/acceptance/booking.spec.ts", specs, suites: [] }] });
const spec = (title: string, status: string, r: object = result()) => ({ title, tests: [{ status, projectName: "w375", results: [r] }] });

describe("capture planning", () => {
  it("makes safe folder names", () => {
    expect(slugify("Owner books a visit (happy path)!")).toBe("owner-books-a-visit-happy-path");
    expect(slugify("../../etc/passwd")).toBe("etc-passwd");
    expect(slugify("???")).toBe("capture");
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(60);
  });

  it("plans one job per passing test with its clip, still, and alt text", () => {
    const { jobs, left } = planJobs(collectTests(report([spec("Customer books a visit", "expected")])), { maxSeconds: 12 });
    expect(left).toEqual([]);
    expect(jobs).toEqual([
      {
        slug: "customer-books-a-visit", title: "Customer books a visit", file: "tests/acceptance/booking.spec.ts",
        alt: "The app on a phone: Customer books a visit", clip_seconds: 4, seconds: 4, video: "/tmp/v.webm", screenshot: "/tmp/s.png"
      }
    ]);
  });

  it("never captures a failing test", () => {
    const { jobs, left } = planJobs(collectTests(report([spec("Pay a deposit", "unexpected"), spec("Flaky one", "flaky")])), { maxSeconds: 12 });
    expect(jobs).toEqual([]);
    expect(left.map(l => l.reason)).toEqual(["the test failed", "the test failed"]);
  });

  it("leaves out a test with no recording, and ignores skipped tests", () => {
    const rows = collectTests(report([spec("No video", "expected", result({ attachments: [] })), spec("Skipped", "skipped")]));
    const { jobs, left } = planJobs(rows, { maxSeconds: 12 });
    expect(jobs).toEqual([]);
    expect(left).toEqual([{ title: "No video", reason: "no recording was produced" }]);
  });

  it("keeps clips short and gives same-named tests their own folders", () => {
    const long = result({ duration: 95_000 });
    const { jobs } = planJobs(collectTests(report([spec("Book", "expected", long), spec("Book", "expected")])), { maxSeconds: 12 });
    expect(jobs.map(j => j.slug)).toEqual(["book", "book-2"]);
    expect(jobs[0]!.seconds).toBe(12);
    expect(jobs[0]!.clip_seconds).toBe(95);
  });

  it("uses the last try of a retried test", () => {
    const rows = collectTests(report([{ title: "Retry", tests: [{ status: "expected", results: [result({ attachments: [] }), result()] }] }]));
    expect(rows[0]!.video).toBe("/tmp/v.webm");
  });
});
