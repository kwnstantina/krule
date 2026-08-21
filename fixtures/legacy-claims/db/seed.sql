/* Anonymised extract of the SIT dataset, used by the regression pack.
   Refreshed 2021-07. */

INSERT INTO handlers (handler_id, name, seniority, market) VALUES
 (1, 'M Whitcombe',  5, 'UK'),
 (2, 'R Jayasinghe', 4, 'UK'),
 (3, 'K Poulter',    2, 'UK'),
 (4, 'D Tremblay',   3, 'CA'),
 (5, 'A Nkemelu',    1, 'CA');

INSERT INTO claims (claim_ref, market, brand, status, settlement_amount, policy_inception, policy_lapse, incident_date, insured_id, counterparty_id, broker_code, handler_id, uses_panel_solicitor, product_type, authorised_at, authorised_by) VALUES
 ('LEI-UK-000101', 'UK', 'DAS',        'A',    850.00, '2020-01-15', NULL,         '2020-06-02', 9001, 7710, 'BR0500', 3, 1, 'BTE', '2020-06-04 09:12:00', 3),
 ('LEI-UK-000102', 'UK', 'DAS',        'A',   4200.00, '2019-11-01', NULL,         '2020-08-19', 9002, 7711, 'BR0500', 2, 1, 'BTE', '2020-08-25 14:40:00', 2),
 ('LEI-UK-000103', 'UK', 'BROKERPLUS', 'P',  12500.00, '2020-03-20', NULL,         '2021-01-07', 9003, 7712, 'BR0042', 3, 1, 'ATE', NULL,                  NULL),
 ('LEI-UK-000104', 'UK', 'DAS',        'R',   9000.00, '2018-05-05', '2020-02-01', '2020-05-30', 9004, 7713, 'BR0500', 2, 1, 'BTE', NULL,                  NULL),
 ('LEI-UK-000105', 'UK', 'BROKERPLUS', 'A',   2400.00, '2020-07-11', NULL,         '2021-02-14', 9005, 7714, 'BR0611', 2, 1, 'BTE', '2021-02-18 11:05:00', 2),
 ('LEI-UK-000106', 'UK', 'DAS',        'A', 185000.00, '2017-09-30', NULL,         '2020-10-22', 9006, 7715, 'BR0500', 1, 1, 'ATE', '2020-11-02 16:20:00', 1),
 ('LEI-UK-000107', 'UK', 'DAS',        'P',  31000.00, '2020-02-28', NULL,         NULL,         9007, 7716, 'BR0117', 3, 1, 'ATE', NULL,                  NULL),
 ('LEI-UK-000108', 'UK', 'BROKERPLUS', 'A',   7600.00, '2019-06-18', NULL,         '2021-03-09', 9008, 7717, 'BR0611', 2, 1, 'BTE', '2021-03-15 10:31:00', 2),
 ('LEI-CA-000201', 'CA', 'DAS',        'A',    600.00, '2020-04-02', NULL,         '2020-09-15', 9009, 7718, 'BR0800', 5, 1, 'BTE', '2020-09-17 13:44:00', 4),
 ('LEI-CA-000202', 'CA', 'DAS',        'A',  15000.00, '2019-08-08', NULL,         '2020-12-01', 9010, 7719, 'BR0800', 4, 1, 'ATE', '2020-12-09 15:02:00', 4),
 ('LEI-CA-000203', 'CA', 'MAPLELEGAL', 'P',  42000.00, '2020-05-25', NULL,         '2021-04-18', 9011, 7720, 'BR0800', 4, 0, 'ATE', NULL,                  NULL),
 ('LEI-CA-000204', 'CA', 'DAS',        'R',   3300.00, '2018-10-10', '2020-06-30', '2021-01-25', 9012, 7721, 'BR0801', 5, 1, 'BTE', NULL,                  NULL);

INSERT INTO disbursements (disbursement_id, claim_ref, category, amount, currency, payment_method, status, resubmit_count, requested_at) VALUES
 ( 1, 'LEI-UK-000102', 'COUNSEL',  3800.00, 'GBP', 'BACS',   'A', 0, '2020-09-02 10:15:00'),
 ( 2, 'LEI-UK-000102', 'MEDICAL',   950.00, 'GBP', 'BACS',   'A', 0, '2020-09-02 10:22:00'),
 ( 3, 'LEI-UK-000102', 'COURT',     480.00, 'GBP', 'BACS',   'R', 2, '2020-10-16 15:48:00'),
 ( 4, 'LEI-UK-000106', 'COUNSEL', 12000.00, 'GBP', 'BACS',   'A', 0, '2020-11-13 11:30:00'),
 ( 5, 'LEI-UK-000106', 'COURT',     545.00, 'GBP', 'BACS',   'A', 0, '2020-11-13 11:35:00'),
 ( 6, 'LEI-UK-000106', 'EXPERT',   2250.00, 'GBP', 'BACS',   'A', 0, '2021-01-08 16:05:00'),
 ( 7, 'LEI-UK-000101', 'MEDICAL',   420.00, 'GBP', 'BACS',   'A', 0, '2020-06-12 09:40:00'),
 ( 8, 'LEI-UK-000105', 'EXPERT',   1750.00, 'GBP', 'CHEQUE', 'A', 0, '2021-03-05 14:12:00'),
 ( 9, 'LEI-UK-000108', 'COUNSEL',  6200.00, 'GBP', 'CHEQUE', 'R', 1, '2021-04-16 12:55:00'),
 (10, 'LEI-CA-000202', 'COUNSEL',  9200.00, 'CAD', 'BACS',   'A', 0, '2021-01-15 15:20:00'),
 (11, 'LEI-CA-000202', 'MEDICAL',  1400.00, 'CAD', 'BACS',   'A', 0, '2021-01-15 15:26:00'),
 (12, 'LEI-CA-000201', 'COURT',     310.00, 'CAD', 'BACS',   'A', 0, '2020-09-25 09:05:00');
