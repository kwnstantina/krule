import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  computeOpsFigures,
  generateOpsEvents,
  opsEventsPath,
  parseOpsEvents,
  workingDaysBetween,
} from "./index";

// Every figure quoted in fixtures/legacy-claims-ops/PLANTED.md. Change the
// generator and these fail; update PLANTED.md together with them.
const PLANTED_FIGURES = {
  claims: 400,
  events: 2893,
  lapseWindowClaims: 11,
  lapseWindowAmount: 174273,
  overriddenOver10k: 7,
  overriddenOver10kAmount: 391808,
  over50kAuthorised: 59,
  over50kWithSecondSignature: 51,
  over50kMissingViaOverride: 5,
  offPanelMidDisbursements: 3,
  offPanelMidAmount: 10107,
  contactBreaches: 162,
  contactMedianWorkingDays: 2,
  autoAuthorised: 42,
  fridayLatePayments: 21,
  br0042Authorised: 20,
  br0042ReassignedToH1: 20,
  decemberAuthorised: 37,
  decemberAuthorisedInDecember: 0,
  br0388WithoutSignOff: 21,
  counselCappedUnderPolicyCap: 17,
  counselShortfall: 4962,
};

describe("legacy-claims-ops event log", () => {
  it("is exactly what the generator produces (run `pnpm generate-ops-events`)", async () => {
    expect(await readFile(opsEventsPath(), "utf8")).toBe(generateOpsEvents());
  });

  it("generates byte-identical output on every run", () => {
    expect(generateOpsEvents()).toBe(generateOpsEvents());
  });

  it("matches every figure quoted in PLANTED.md", async () => {
    const rows = parseOpsEvents(await readFile(opsEventsPath(), "utf8"));
    expect(computeOpsFigures(rows)).toEqual(PLANTED_FIGURES);
  });

  it("counts working days without weekends", () => {
    const friday = Date.parse("2024-01-05T16:00:00Z");
    const monday = Date.parse("2024-01-08T09:00:00Z");
    expect(workingDaysBetween(friday, monday)).toBe(1);
    expect(workingDaysBetween(friday, friday)).toBe(0);
  });
});
