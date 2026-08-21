# Claims Authorisation — Underwriting Wiki

> Owner: Underwriting Operations
> Last reviewed: March 2022
> Supersedes the LEI Authorisation Manual (2014)

This page is the reference for how a legal-expenses claim is authorised. Handlers
should read it alongside the Handler Guide.

## Policy validity

A claim is only considered if the policy was live at the date of the incident.

Where a policy has lapsed, we allow a **30 day** grace window: if the incident
occurred within 30 days of the lapse date the claim is still assessed on its
merits. Beyond 30 days the claim is rejected outright and the handler does not
need to seek approval to close it.

## Conflict of interest

Where the insured party and the counterparty are the same legal entity the claim
is rejected immediately. This happens more often than you would expect on group
policies and is not negotiable.

## Authorisation limits

| Market | Auto-authorised below | Handler limit | Senior sign-off |
|--------|----------------------|---------------|-----------------|
| UK     | £1,000               | £10,000       | over £10,000    |
| CA     | CAD 750              | £10,000       | over £10,000    |

Claims under the auto-authorisation threshold are released by the system without
handler involvement. Anything over £10,000 requires sign-off from a senior
handler (seniority grade 4 or 5).

Claims above **£50,000** additionally require a second signature from the Claims
Manager before the payment run will pick them up. Use the "Second Approval" tab
on the claim record.

## Settlement ceiling

No single claim may be recorded with a settlement value above **£250,000**. Files
expected to exceed this are referred to the Major Loss team and handled outside
this system.

## Provisional cover

Where underwriting cannot confirm cover immediately, the handler may grant
**provisional cover for 14 days** while the policy history is retrieved. Set the
claim to provisional status and diarise the review. Provisional cover lapses
automatically if it is not confirmed within the 14 days.

## Panel solicitors

DAS-underwritten business is exempt from the panel requirement — DAS operate
their own approved list and we accept it.

For all other brands, a claim over the referral limit must use a panel solicitor.
A non-panel instruction over that limit is rejected. See the Handler Guide for
the current referral limit.

## After-the-event (ATE) product

ATE claims require the solicitor's signed Conditional Fee Agreement to be
uploaded to the claim record before authorisation can be granted. The system will
not let you authorise an ATE claim without it.
