PRAGMA foreign_keys=ON;

-- Crown signup email verification. Existing preview-activated accounts stay intact.
-- Raw verification links are NEVER stored: verification_token holds a SHA-256
-- digest salted with SESSION_PEPPER. New accounts remain pending until verified.
ALTER TABLE enrollment_requests ADD COLUMN member_id INTEGER REFERENCES members(id);
ALTER TABLE enrollment_requests ADD COLUMN expires_at TEXT;
ALTER TABLE enrollment_requests ADD COLUMN verified_at TEXT;
ALTER TABLE enrollment_requests ADD COLUMN last_sent_at TEXT;
ALTER TABLE enrollment_requests ADD COLUMN referral_code TEXT;

CREATE INDEX IF NOT EXISTS idx_crown_verification_member_status
  ON enrollment_requests(member_id,status,expires_at);
CREATE INDEX IF NOT EXISTS idx_crown_referral_code
  ON enrollment_requests(referral_code,status);
