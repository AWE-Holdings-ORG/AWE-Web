import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
db = sqlite3.connect(":memory:")
db.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE members (
 id INTEGER PRIMARY KEY,aw_id TEXT UNIQUE,email TEXT UNIQUE,
 crown_name TEXT UNIQUE,status TEXT NOT NULL,verified_at TEXT
);
CREATE TABLE enrollment_requests (
 id INTEGER PRIMARY KEY,email TEXT NOT NULL,crown_name TEXT NOT NULL,
 verification_token TEXT NOT NULL UNIQUE,status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE member_access (
 member_id INTEGER NOT NULL,house_slug TEXT NOT NULL,destination TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 1,priority INTEGER NOT NULL DEFAULT 100,
 PRIMARY KEY(member_id,house_slug)
);
INSERT INTO members VALUES(1,'AWE-000001','owner@example.com','Owner','active',datetime('now'));
INSERT INTO members VALUES(2,'AWE-000002','x@example.com','X','active',datetime('now'));
INSERT INTO members VALUES(3,'AWE-000003','new@example.com','New Fan','pending',NULL);
INSERT INTO enrollment_requests(email,crown_name,verification_token,status)
VALUES('old@example.com','Old Preview','legacy-plaintext-example','preview-activated');
""")
db.executescript((root/"migrations/0027_crown_email_verification.sql").read_text())
columns={row[1] for row in db.execute("PRAGMA table_info(enrollment_requests)")}
assert {"member_id","expires_at","verified_at","last_sent_at","referral_code"}<=columns
db.execute("""
INSERT INTO enrollment_requests(email,crown_name,verification_token,status,member_id,
expires_at,last_sent_at,referral_code)
VALUES('new@example.com','New Fan','sha256-digest-placeholder','pending',3,
datetime('now','+24 hours'),datetime('now'),'x-tha-god')
""")
assert db.execute("SELECT status FROM members WHERE id=3").fetchone()[0]=="pending"
assert not db.execute("SELECT 1 FROM member_access WHERE member_id=3").fetchone()
db.execute("""
UPDATE enrollment_requests SET status='verified',verified_at=datetime('now')
WHERE member_id=3 AND status='pending' AND expires_at>datetime('now')
""")
db.execute("""
UPDATE members SET status='active',verified_at=datetime('now')
WHERE id=3 AND EXISTS(
 SELECT 1 FROM enrollment_requests WHERE member_id=3 AND status='verified')
""")
db.execute("INSERT INTO member_access VALUES(3,'crown-house','/crown/',1,1)")
assert db.execute("SELECT status,verified_at FROM members WHERE id=3").fetchone()[0]=="active"
assert db.execute("SELECT referral_code FROM enrollment_requests WHERE member_id=3").fetchone()[0]=="x-tha-god"
assert db.execute("SELECT status FROM enrollment_requests WHERE id=1").fetchone()[0]=="preview-activated"
print("PASS: pending, verified and legacy Crown migration states")
