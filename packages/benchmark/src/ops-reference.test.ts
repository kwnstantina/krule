import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { evaluateHypothesis, parseEventLog, type Observation } from "@repo/observe";
import { computeOpsFigures, opsEventsPath, parseOpsEvents } from "./index";
import { OPS_REFERENCE_HYPOTHESES } from "./ops-reference";

// The engine in @repo/observe and the hand-coded counts in ops-findings.ts are
// written independently. Agreement here means the query language can express
// each planted finding and measures it correctly.
describe("reference hypotheses over the ops event log", async () => {
  const csv = await readFile(opsEventsPath(), "utf8");
  const log = parseEventLog(csv);
  const figures = computeOpsFigures(parseOpsEvents(csv));
  const run = (id: string): Observation => evaluateHypothesis(log, OPS_REFERENCE_HYPOTHESES[id]!);

  it("F-01 lapse window: breached, same claims and amount", () => {
    const o = run("F-01");
    expect(o.status).toBe("breached");
    expect([o.violating, o.violatingSum]).toEqual([figures.lapseWindowClaims, figures.lapseWindowAmount]);
  });

  it("F-02 senior sign-off: breached by the overrides", () => {
    const o = run("F-02");
    expect(o.status).toBe("breached");
    expect([o.violating, o.violatingSum]).toEqual([figures.overriddenOver10k, figures.overriddenOver10kAmount]);
  });

  it("F-03 second signature: mostly followed by hand", () => {
    const o = run("F-03");
    expect([o.population, o.conforming]).toEqual([figures.over50kAuthorised, figures.over50kWithSecondSignature]);
  });

  it("F-04 panel solicitor: breached on mid-sized disbursements", () => {
    const o = run("F-04");
    expect([o.violating, o.violatingSum]).toEqual([figures.offPanelMidDisbursements, figures.offPanelMidAmount]);
  });

  it("F-05 first contact: breached", () => {
    expect(run("F-05").violating).toBe(figures.contactBreaches);
  });

  it("F-06 automatic authorisation: holds in both markets (control case)", () => {
    const uk = run("F-06-UK");
    const ca = run("F-06-CA");
    expect([uk.status, ca.status]).toEqual(["holds", "holds"]);
    expect(uk.population + ca.population).toBe(figures.autoAuthorised);
  });

  it("F-07 Friday cutoff: confirmed as an undocumented pattern", () => {
    const o = run("F-07");
    expect(o.status).toBe("confirmed");
    expect(o.population).toBe(figures.fridayLatePayments);
  });

  it("F-08 BR0042 reassignment: confirmed shadow rule", () => {
    const o = run("F-08");
    expect(o.status).toBe("confirmed");
    expect([o.population, o.conforming]).toEqual([figures.br0042Authorised, figures.br0042ReassignedToH1]);
  });

  it("F-09 December freeze: confirmed", () => {
    const o = run("F-09");
    expect(o.status).toBe("confirmed");
    expect(o.population).toBe(figures.decemberAuthorised);
    expect(o.violating).toBe(figures.decemberAuthorisedInDecember);
  });

  it("F-10 complaints: no evidence, not a breach (control case)", () => {
    const o = run("F-10");
    expect(o.status).toBe("no-evidence");
    expect(o.violating).toBe(0);
  });

  it("F-11 BR0388 missing from the coded watchlist: breached", () => {
    expect(run("F-11").violating).toBe(figures.br0388WithoutSignOff);
  });

  it("F-12 counsel cap: breached, shortfall measurable", () => {
    const o = run("F-12");
    expect(o.violating).toBe(figures.counselCappedUnderPolicyCap);
    expect(o.violatingSum! - o.violating * 3_500).toBe(figures.counselShortfall);
  });
});
