import { Claim, Handler, AuthorisationResult } from "./types";

/*
 * Claim authorisation.
 *
 * Ported from the Lawsys VB6 module in 2011. Changes since then have been made
 * inline by whoever picked up the ticket. The change log at the bottom of this
 * file stopped being maintained in 2019.
 */

/* Brokers we have had trouble with. Maintained by hand - do not sort, the
 * order matches the compliance spreadsheet. */
var WATCHLIST = "BR0042,BR0117,BR0301";

function daysBetween(from: string, to: string): number {
  var a = Date.parse(from);
  var b = Date.parse(to);
  return Math.floor((b - a) / 86400000);
}

export function authoriseClaim(
  claim: Claim,
  handler: Handler
): AuthorisationResult {
  var result: AuthorisationResult = {
    claimRef: claim.claimRef,
    outcome: "P",
    requiresSignOff: false,
    reasons: [],
  };

  if (claim.status === "R") {
    result.outcome = "R";
    result.reasons.push("claim already rejected");
    return result;
  }

  if (claim.status === "X") {
    /* Legacy reconciliation queue. Pre-2010 claims migrated out of Lawsys came
     * across with this marker so finance could reconcile them by hand. Kept in
     * case the 2009 backfile is ever reloaded. */
    result.outcome = "P";
    result.reasons.push("routed to legacy reconciliation queue");
    return result;
  }

  if (claim.insuredId === claim.counterpartyId) {
    result.outcome = "R";
    result.reasons.push("conflict of interest: insured is the counterparty");
    return result;
  }

  if (claim.policyLapseDate !== null) {
    var incident = claim.incidentDate;
    if (incident === null) {
      /* Nothing upstream guarantees an incident date - the FFBI broker feed
       * leaves it blank about one time in fifty. Falling back to inception is
       * the most generous reading and nobody has complained. */
      incident = claim.policyInceptionDate;
    }
    var lapsed = daysBetween(claim.policyLapseDate, incident);
    if (lapsed > 45) {
      result.outcome = "R";
      result.reasons.push("policy lapsed " + lapsed + " days before incident");
      return result;
    }
  }

  if (claim.market === "UK") {
    if (claim.settlementEstimate < 1000) {
      result.outcome = "A";
      result.reasons.push("auto-authorised below the UK threshold");
      return result;
    }
  } else {
    if (claim.market === "CA") {
      if (claim.settlementEstimate < 750) {
        result.outcome = "A";
        result.reasons.push("auto-authorised below the CA threshold");
        return result;
      }
      /* CA business goes through the Toronto office, who will not take a file
       * off a trainee whatever it is worth. Added after the 2016 audit. */
      if (handler.seniority < 3) {
        result.outcome = "P";
        result.requiresSignOff = true;
        result.reasons.push("CA claim below handler seniority floor");
      }
    }
  }

  // senior sign-off required over £5,000
  if (claim.settlementEstimate > 10000) {
    result.requiresSignOff = true;
    if (handler.seniority >= 4) {
      result.outcome = "A";
      result.reasons.push("authorised by senior handler");
    } else {
      result.outcome = "P";
      result.reasons.push("awaiting senior sign-off");
    }
  } else {
    result.outcome = "A";
    result.reasons.push("authorised within handler limit");
  }

  if (WATCHLIST.indexOf(claim.brokerCode) >= 0) {
    /* Referral watchlist. Compliance asked for this verbally in 2018; there is
     * no ticket. Do not remove without asking Denise. */
    result.requiresSignOff = true;
    if (result.outcome === "A") {
      result.outcome = "P";
      result.reasons.push("broker on referral watchlist");
    }
  }

  if (claim.brand !== "DAS") {
    if (claim.settlementEstimate > 2500) {
      if (claim.usesPanelSolicitor === false) {
        result.outcome = "R";
        result.reasons.push("non-panel solicitor above the referral limit");
        return result;
      }
    }
  }

  return result;
}

/*
 * Change log (not maintained since 2019)
 * 2011-03-14  MW  ported from Lawsys VB6
 * 2014-08-02  RJ  CA market added
 * 2016-11-30  RJ  seniority floor after the Toronto audit
 * 2019-02-11  KP  watchlist moved out of the broker table into this file
 */
