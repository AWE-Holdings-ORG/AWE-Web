import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const worker=readFileSync(fileURLToPath(new URL("../worker.js",import.meta.url)),"utf8");
const gate=worker.match(/async function crownEnrollmentReady[\s\S]*?(?=export default)/)?.[0]||"";
const signup=worker.match(/async function enroll\([\s\S]*?(?=async function resendCrownVerification)/)?.[0]||"";
const verification=worker.match(/async function verifyCrownEmail\([\s\S]*?(?=export default)/)?.[0]||"";

test("Crown worker JS compiles",()=>{
  assert.doesNotThrow(()=>new Function(worker.replace("export default {","const workerDefault = {")));
});
test("registration fails closed without email provider, sender, origin, peppers and Turnstile keys",()=>{
  for(const key of ["RESEND_API_KEY","CROWN_EMAIL_FROM","CROWN_PUBLIC_ORIGIN","TURNSTILE_SECRET","TURNSTILE_SITE_KEY","PCK_PEPPER","SESSION_PEPPER"]){
    assert.ok(gate.includes("env."+key),key+" missing");
  }
  assert.match(gate,/PRAGMA table_info\(enrollment_requests\)/);
});
test("pending signup has no access grant and no active identity",()=>{
  assert.match(signup,/VALUES\(\?,\?,\?,'pending',NULL\)/);
  assert.doesNotMatch(signup,/INSERT INTO member_access/);
  assert.match(signup,/tokenDigest\(rawToken,env\.SESSION_PEPPER\)/);
  assert.match(signup,/await verifyTurnstile\(body\.turnstileToken,request,env\)/);
  assert.match(signup,/referralCode/);
});
test("verification requires a live one-use token, activates and then grants Crown",()=>{
  assert.match(verification,/e\.expires_at>datetime\('now'\)/);
  assert.match(verification,/e\.status='pending'/);
  assert.match(verification,/WHERE id=\? AND verification_token=\? AND status='pending'/);
  assert.match(verification,/UPDATE members SET status='active',verified_at=datetime\('now'\)/);
  assert.match(verification,/SELECT id,'crown-house','\/crown\/',1,1 FROM members WHERE id=\? AND status='active'/);
  assert.match(verification,/results\[0\]\?\.meta\?\.changes/);
});
test("both resend and verification endpoints wired",()=>{
  assert.match(worker,/\/api\/crown\/signup-config/);
  assert.match(worker,/\/api\/crown\/verify-email/);
  assert.match(worker,/\/api\/crown\/resend-verification/);
});
