import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const PAGE=fileURLToPath(new URL("../public/crowd/x/index.html",import.meta.url));
const WORKER=fileURLToPath(new URL("../worker-entry.js",import.meta.url));
const SERVICE=fileURLToPath(new URL("../lib/player-catalog-service.js",import.meta.url));

const html=readFileSync(PAGE,"utf8");
const worker=readFileSync(WORKER,"utf8");
const service=readFileSync(SERVICE,"utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/i);

test("Tha X Filez public page script parses",()=>{
  assert.ok(match,"Tha X Filez script block missing");
  assert.doesNotThrow(()=>new Function(match[1]));
});

test("Tha X Filez uses anonymous public catalog, not Crown catalog",()=>{
  const script=match?.[1]||"";
  assert.match(script,/\/api\/archivez\/catalog\?artist=x-tha-god&collection=tha-x-filez/);
  assert.doesNotMatch(script,/\/api\/crown\/player\/catalog/);
  assert.match(script,/collection_slug\|\|""/);
  assert.match(script,/tha-x-filez/);
  assert.match(script,/collection_file_code/);
  assert.match(html,/noindex,nofollow/);
});

test("public Archivez endpoint uses public surface without Crown identity",()=>{
  const route=worker.match(/if\(url\.pathname==="\/api\/archivez\/catalog"[\s\S]*?\n    \}/)?.[0]||"";
  assert.match(route,/archivezCatalogResponse/);
  assert.match(route,/surface:"public"/);
  assert.match(route,/crownMemberId:null/);
  assert.doesNotMatch(route,/crownIdentity\(/);
});

test("public surface filters to PUBLIC access before sanitization",()=>{
  assert.match(service,/surface==="public"[\s\S]*?access_state\)\.toLowerCase\(\)==="public"/);
  assert.match(service,/const safe=resolveAndSanitizeMedia\(surfaceFiltered,viewer\)/);
});

test("Tha X Filez public page has no Crown engagement controls",()=>{
  assert.doesNotMatch(html,/CROWD COMMENTS/);
  assert.doesNotMatch(html,/ANALYTICS/);
  assert.doesNotMatch(html,/\/api\/crown\/player\/view/);
});
