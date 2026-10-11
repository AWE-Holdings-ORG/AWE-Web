import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const WORKER=fileURLToPath(new URL("../worker-entry.js",import.meta.url));
const worker=readFileSync(WORKER,"utf8");

test("personal roster route requires Crown identity",()=>{
  const block=worker.match(/if\(url\.pathname==="\/api\/crown\/player\/roster"[\s\S]*?\n    \}/)?.[0]||"";
  assert.match(block,/crownIdentity\(request,env\)/);
  assert.match(block,/playerRosterResponse/);
});

test("roster requires access to the requested House",()=>{
  assert.match(worker,/async function memberHasHouse/);
  assert.match(worker,/HOUSE ACCESS REQUIRED/);
  assert.match(worker,/member_access/);
});

test("roster combines default House signals with member unlocks",()=>{
  const block=worker.match(/async function playerRosterResponse[\s\S]*?function normalizeCheatCode/)?.[0]||"";
  assert.match(block,/house_player_roster/);
  assert.match(block,/member_signal_unlocks/);
  assert.match(block,/visible_by_default=1/);
  assert.match(block,/u\.member_id IS NOT NULL/);
  assert.match(block,/capacity:12/);
});

test("Cheat Codes are hashed and member-specific",()=>{
  const block=worker.match(/async function playerCheatCodeResponse[\s\S]*?async function engagementMediaId/)?.[0]||"";
  assert.match(worker,/crypto\.subtle\.digest\("SHA-256"/);
  assert.match(block,/player_cheat_codes/);
  assert.match(block,/player_cheat_redemptions/);
  assert.match(block,/member_signal_unlocks/);
  assert.match(block,/unlock_source.*cheat-code/s);
  assert.match(block,/player_cheat_signal_unlocked/);
  assert.doesNotMatch(block,/SELECT[^\n]*code_hash[^\n]*AS code/i);
});

test("no actual Cheat Code is hard-coded in runtime",()=>{
  assert.doesNotMatch(worker,/XMARKSTHESPOT|CROWDSHYT2|DEMO-CHEAT/i);
});
