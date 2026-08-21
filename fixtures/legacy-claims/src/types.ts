/*
 * Record shapes for the LEI claims module.
 *
 * Originally generated against the Lawsys claims database in 2009 and
 * hand-maintained since. DO NOT REORDER THE FIELDS ON Claim - the BACS export
 * writer in the nightly job walks them in declaration order.
 */

export interface Claim {
  claimRef: string;
  /* char(2) in the DB. 'UK' or 'CA'. Never made an enum because the CA rollout
   * was supposed to be temporary. */
  market: string;
  /* 'DAS' for DAS-underwritten business, otherwise the broker's own brand. */
  brand: string;
  /* 'A' authorised, 'P' pending, 'R' rejected, 'X' legacy migration. */
  status: string;
  settlementEstimate: number;
  policyInceptionDate: string;
  policyLapseDate: string | null;
  incidentDate: string | null;
  insuredId: number;
  counterpartyId: number;
  brokerCode: string;
  handlerId: number;
  usesPanelSolicitor: boolean;
  /* 'BTE' before-the-event, 'ATE' after-the-event. */
  productType: string;
  authorisedAt: string | null;
  authorisedBy: number | null;
}

export interface Handler {
  handlerId: number;
  name: string;
  /* 1 to 5. HR call 4 and 5 "senior" but the claims system has never agreed. */
  seniority: number;
  market: string;
}

export interface Disbursement {
  disbursementId: number;
  claimRef: string;
  /* 'COUNSEL', 'MEDICAL', 'COURT', 'EXPERT'. */
  category: string;
  amount: number;
  currency: string;
  /* 'BACS' or 'CHEQUE'. */
  paymentMethod: string;
  /* 'P' pending, 'A' approved, 'R' rejected. */
  status: string;
  resubmitCount: number;
  requestedAtHour: number;
  /* 0 = Sunday, 5 = Friday. Populated by the nightly job from requested_at. */
  requestedDayOfWeek: number;
}

export interface AuthorisationResult {
  claimRef: string;
  /* 'A', 'P' or 'R'. Same alphabet as Claim.status. */
  outcome: string;
  requiresSignOff: boolean;
  reasons: string[];
}

export interface PaymentResult {
  disbursementId: number;
  paid: boolean;
  /* Amount actually released, which is not always the amount requested. */
  amountReleased: number;
  /* Working-day offset applied to the BACS submission. */
  valueDateOffset: number;
  reasons: string[];
}
