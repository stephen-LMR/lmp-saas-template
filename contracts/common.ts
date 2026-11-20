// COPIED FILE. Do not edit here.
// Source: lmp-builder src/contracts/common.ts at commit e5a68f43cfc6affefa7e8e256f5bf09f4077aed5.
// To change the shape, ask Lane E; then copy the file again and update this header.
// Shared primitives for every contract. Contracts are zod schemas plus their inferred
// types. They hold data shapes and a few pure rules, never I/O. See README.md here.
import { z } from "zod";

export const Id = z.uuid();
export type Id = z.infer<typeof Id>;

// ISO 8601 with an offset, which is what Postgres timestamptz returns through Supabase.
export const Timestamp = z.iso.datetime({ offset: true });
export const Email = z.email();
export const Cents = z.number().int().nonnegative();
export const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const E164Phone = z.string().regex(/^\+[1-9]\d{7,14}$/);

// Project stages. Must stay identical to Stage in src/pipeline/stateMachine.ts and to the
// project_stage enum in supabase/migrations/001_init.sql (compat.ts checks the first).
export const Stage = z.enum([
  "intake_scheduled", "call_recorded", "researching", "spec_drafted",
  "awaiting_spec_approval", "spec_approved", "building", "preview_sent",
  "revising", "awaiting_golive", "live", "paused", "cancelled"
]);
export type Stage = z.infer<typeof Stage>;

// How the call reached the bot (CLAUDE.md "End-to-end flow", step 1).
export const IntakeChannel = z.enum([
  "video",             // Recall bot in Zoom, Meet, Teams, Webex, GoTo, Slack Huddles
  "phone_merge",       // agent merged the bot's number into a call
  "phone_bridge",      // bot dialed a conference bridge and entered the PIN
  "in_person_call",    // agent called the bot's number on speakerphone
  "in_person_upload",  // agent recorded in the portal and uploaded
  "manual"             // transcript pasted by an admin
]);
export type IntakeChannel = z.infer<typeof IntakeChannel>;
