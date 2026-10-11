import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const src=readFileSync(fileURLToPath(new URL("../public/script.js",import.meta.url)),"utf8");

test("home Crown invitation script parses",()=>{
  assert.doesNotThrow(()=>new Function(src));
});

test("explicit signup and login invitations bypass only the hidden discovery gesture",()=>{
  assert.match(src,/new URLSearchParams\(window\.location\.search\)\.get\('crown'\)/);
  assert.match(src,/\['signup','login'\]\.includes\(intent\)/);
  assert.match(src,/openCrownDoor\(\);\s*enterTerminal\(\);/);
  assert.match(src,/if\(intent==='signup'\)crownEnroll\?\.click\(\)/);
});

test("invitations do not bypass the server-side identity or house gates",()=>{
  assert.match(src,/fetch\('\/api\/crown\/enroll'/);
  assert.match(src,/fetch\('\/api\/crown\/auth'/);
});
