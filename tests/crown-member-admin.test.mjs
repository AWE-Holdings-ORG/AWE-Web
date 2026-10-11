import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const WORKER=fileURLToPath(new URL("../worker.js",import.meta.url));
const DRT=fileURLToPath(new URL("../public/crown/index.html",import.meta.url));
const worker=readFileSync(WORKER,"utf8");
const drt=readFileSync(DRT,"utf8");
const match=drt.match(/<script>([\s\S]*?)<\/script>/i);

test("valid House key persists discovery before access grant",()=>{
  assert.match(worker,/house_discovered/);
  assert.match(worker,/last_visited_at\) VALUES\(\?,\?,\?,datetime\('now'\),NULL\)/);
  assert.match(worker,/HOUSE DISCOVERED \/\/ ACCESS NOT YET GRANTED/);
});

test("owner member controls are restricted to AWE-000001",()=>{
  assert.match(worker,/function crownOwner\(member\)/);
  assert.match(worker,/member\?\.aw_id==="AWE-000001"/);
  assert.match(worker,/OWNER ACCESS REQUIRED/);
});

test("owner can list members without exposing email",()=>{
  const block=worker.match(/async function crownAdminMembers[\s\S]*?async function crownAdminGrant/)?.[0]||"";
  assert.match(block,/aw_id/);
  assert.match(block,/crown_name/);
  assert.match(block,/member_access/);
  assert.match(block,/member_discoveries/);
  assert.doesNotMatch(block,/m\.email/);
});

test("owner CROWD grant is explicit and server-side",()=>{
  const block=worker.match(/async function crownAdminGrant[\s\S]*?async function visitHouse/)?.[0]||"";
  assert.match(block,/INSERT INTO member_access/);
  assert.match(block,/owner_access_granted/);
  assert.match(block,/owner-grant/);
});

test("Da Round Table member console script parses and auto-reveals for owner",()=>{
  assert.ok(match,"DRT script missing");
  assert.doesNotThrow(()=>new Function(match[1]));
  assert.match(drt,/id="members-admin"[^>]*hidden/);
  assert.match(drt,/id="member-console"[^>]*hidden/);
  assert.match(drt,/Crown Members & House Access/);
  assert.match(drt,/PENDING DISCOVERIES SHOW HERE/);
  assert.match(match[1],/data\.awId==='AWE-000001'/);
  assert.match(match[1],/memberConsole\.hidden=false/);
  assert.match(match[1],/loadMembers\(\)/);
  assert.match(match[1],/\/api\/crown\/admin\/members/);
  assert.match(match[1],/\/api\/crown\/admin\/grant/);
});
