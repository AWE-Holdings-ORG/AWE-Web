import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const src=readFileSync(fileURLToPath(new URL("../public/script.js",import.meta.url)),"utf8");
const join=readFileSync(fileURLToPath(new URL("../public/join/index.html",import.meta.url)),"utf8");
const verify=readFileSync(fileURLToPath(new URL("../public/verify/index.html",import.meta.url)),"utf8");
const worker=readFileSync(fileURLToPath(new URL("../worker.js",import.meta.url)),"utf8");

test("home Crown invitation script parses",()=>assert.doesNotThrow(()=>new Function(src)));
for(const [name,html] of [["join",join],["verify",verify]]){
  test(name+" page inline script parses",()=>{
    const body=html.match(/<script>([\s\S]*?)<\/script>/i);
    assert.ok(body,name+" inline script missing");
    assert.doesNotThrow(()=>new Function(body[1]));
  });
}
test("explicit signup link bypasses hidden AW gesture but does not grant access",()=>{
  assert.match(src,/new URLSearchParams\(window\.location\.search\)\.get\('crown'\)/);
  assert.match(src,/if\(intent==='signup'\)\{window\.location\.replace\(crownJoinUrl\(\)\)/);
  assert.match(src,/openCrownDoor\(\);\s*enterTerminal\(\)/);
  assert.match(src,/crownEnroll\?\.addEventListener\('click',\(\)=>window\.location\.assign\(crownJoinUrl\(\)\)\)/);
  assert.match(worker,/url\.pathname==="\x2fjoin\x2fx"/);
  assert.match(worker,/\/join\/\?ref=x-tha-god/);
});
test("join UI uses server-side signup config and Cloudflare Turnstile",()=>{
  assert.match(join,/\/api\/crown\/signup-config/);
  assert.match(join,/\/api\/crown\/enroll/);
  assert.match(join,/turnstile\.render/);
  assert.match(join,/referralCode:ref/);
  assert.match(join,/\/api\/crown\/resend-verification/);
});
test("verify UI only consumes token with an explicit POST button",()=>{
  assert.match(verify,/addEventListener\("click"/);
  assert.match(verify,/\/api\/crown\/verify-email/);
  assert.match(verify,/method:"POST"/);
  assert.doesNotMatch(verify,/location\.assign\(["']\/crown/);
});
