/**
 * Sha the legacy-claims fixture was committed at (`feat(02-01)`). The answer key
 * stamps it on every provenance entry, so Phase 5's drift check has a baseline.
 */
export const FIXTURE_COMMIT = "e73742adf0f5f92803e71cabd198f0de12e08cd4";

/** Fixed rather than `now`, so regenerating an unchanged key is a no-op diff. */
export const FIXTURE_GENERATED_AT = "2026-08-21T17:14:00.000Z";
