/* LEI claims schema.
   Scripted out of the Lawsys production database with SSMS "Generate Scripts"
   in 2018 and trimmed by hand. Constraint names are the generated ones, which
   is why they are inconsistent. */

CREATE TABLE handlers (
    handler_id  INT          NOT NULL PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL,
    seniority   TINYINT      NOT NULL,
    market      CHAR(2)      NOT NULL,
    CONSTRAINT CK_handlers_seniority CHECK (seniority BETWEEN 1 AND 5),
    CONSTRAINT CK_handlers_market    CHECK (market IN ('UK','CA'))
);

CREATE TABLE claims (
    claim_ref            VARCHAR(20)   NOT NULL PRIMARY KEY,
    market               CHAR(2)       NOT NULL,
    brand                VARCHAR(20)   NOT NULL,
    status               CHAR(1)       NOT NULL,
    settlement_amount    DECIMAL(12,2) NULL,
    policy_inception     DATE          NOT NULL,
    policy_lapse         DATE          NULL,
    incident_date        DATE          NULL,
    insured_id           INT           NOT NULL,
    counterparty_id      INT           NOT NULL,
    broker_code          CHAR(6)       NOT NULL,
    handler_id           INT           NOT NULL,
    uses_panel_solicitor BIT           NOT NULL,
    product_type         CHAR(3)       NOT NULL,
    authorised_at        DATETIME      NULL,
    authorised_by        INT           NULL,
    CONSTRAINT CK_claims_settlement_max CHECK (settlement_amount <= 250000),
    CONSTRAINT CK_claims_market         CHECK (market IN ('UK','CA')),
    CONSTRAINT CK_claims_product        CHECK (product_type IN ('BTE','ATE')),
    CONSTRAINT CK_claims_ref_format     CHECK (claim_ref LIKE 'LEI-__-[0-9][0-9][0-9][0-9][0-9][0-9]'),
    CONSTRAINT FK_claims_handler        FOREIGN KEY (handler_id)    REFERENCES handlers (handler_id),
    CONSTRAINT FK_claims_authoriser     FOREIGN KEY (authorised_by) REFERENCES handlers (handler_id)
);

CREATE TABLE disbursements (
    disbursement_id INT           NOT NULL PRIMARY KEY,
    claim_ref       VARCHAR(20)   NOT NULL,
    category        VARCHAR(10)   NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    currency        CHAR(3)       NOT NULL,
    payment_method  VARCHAR(6)    NOT NULL,
    status          CHAR(1)       NOT NULL,
    resubmit_count  INT           NOT NULL DEFAULT 0,
    requested_at    DATETIME      NOT NULL,
    CONSTRAINT CK_disb_amount_positive CHECK (amount > 0),
    CONSTRAINT CK_disb_category        CHECK (category IN ('COUNSEL','MEDICAL','COURT','EXPERT')),
    CONSTRAINT FK_disb_claim           FOREIGN KEY (claim_ref) REFERENCES claims (claim_ref)
);

CREATE INDEX IX_disbursements_claim_ref ON disbursements (claim_ref);
