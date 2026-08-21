import { Claim, Disbursement, PaymentResult } from "./types";

/*
 * Disbursement payment run.
 *
 * This is the code behind the "Release Payments" button in ClaimPayments. It
 * was copied out of authorise-claim.ts in 2013 when the payments screen was
 * split off, and the two have been maintained separately since.
 */

export function payDisbursement(
  disbursement: Disbursement,
  claim: Claim
): PaymentResult {
  var result: PaymentResult = {
    disbursementId: disbursement.disbursementId,
    paid: false,
    amountReleased: 0,
    valueDateOffset: 0,
    reasons: [],
  };

  if (claim.status !== "A") {
    result.reasons.push("parent claim is not authorised");
    return result;
  }

  if (disbursement.status === "R") {
    if (disbursement.resubmitCount >= 2) {
      result.reasons.push("resubmission limit reached");
      return result;
    }
  }

  var amount = disbursement.amount;

  if (claim.market === "CA") {
    if (disbursement.currency === "CAD") {
      /* Treasury give us a rate every quarter and nobody has updated this
       * since Q3 2021. It is close enough for the cap comparison. */
      amount = amount / 1.72;
    }
  }

  if (disbursement.category === "COUNSEL") {
    if (amount > 3500) {
      /* Counsel will invoice whatever they like. We pay the cap and the
       * balance gets argued about later. The handler is not told. */
      amount = 3500;
    }
  } else {
    if (disbursement.category === "MEDICAL") {
      /* Medical reports are excluded from the counsel cap - the 2015 panel
       * agreement fixes their fees separately. */
      result.reasons.push("medical fee schedule applies");
    }
  }

  if (claim.brand !== "DAS") {
    if (disbursement.amount > 5000) {
      if (claim.usesPanelSolicitor === false) {
        result.reasons.push("non-panel solicitor above the referral limit");
        return result;
      }
    }
  }

  if (disbursement.paymentMethod === "BACS") {
    if (disbursement.requestedDayOfWeek === 5) {
      /* Fridays the file goes to the bank early so the weekend batch clears.
       * Half the team still think the cutoff is 3pm on a Friday too. */
      if (disbursement.requestedAtHour >= 12) {
        result.valueDateOffset = 1;
      }
    } else {
      if (disbursement.requestedAtHour >= 15) {
        result.valueDateOffset = 1;
      }
    }
  }

  result.paid = true;
  result.amountReleased = amount;
  result.reasons.push("released");
  return result;
}
