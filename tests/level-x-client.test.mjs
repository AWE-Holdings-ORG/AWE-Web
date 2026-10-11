import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const LEVEL_X=fileURLToPath(new URL("../public/crown/crowd/level-x/index.html",import.meta.url));
const CATALOG_SERVICE=fileURLToPath(new URL("../lib/player-catalog-service.js",import.meta.url));
const html=readFileSync(LEVEL_X,"utf8");
const catalogService=readFileSync(CATALOG_SERVICE,"utf8");
const match=html.match(/<script>([\s\S]*?)<\/script>/i);

test("LEVEL X inline Player script parses",()=>{
  assert.ok(match,"LEVEL X script block missing");
  assert.doesNotThrow(()=>new Function(match[1]));
});

test("LEVEL X qualified-view wiring requires real playback signals",()=>{
  const script=match?.[1]||"";
  assert.match(script,/BATTLE_QUALIFIED_VIEW_MS\s*=\s*120000/);
  assert.match(script,/DEFAULT_QUALIFIED_VIEW_MS\s*=\s*10000/);
  assert.match(script,/qualifiedViewMs\(item\)/);
  assert.match(script,/media_type\|\|""\)\.toLowerCase\(\)===["']battle["']/);
  assert.match(script,/YT\.PlayerState\.PLAYING/);
  assert.match(script,/addEventListener\("playing"/);
  assert.match(script,/qualifiedMediaIds\.has\(mediaId\)/);
  assert.match(script,/\/api\/crown\/player\/view/);
});

test("LEVEL X comments honor catalog authorization state",()=>{
  const script=match?.[1]||"";
  assert.match(script,/state\.active\.authorized===false/);
  assert.match(script,/LOCKED SIGNAL \/\/ ENGAGEMENT UNAVAILABLE/);
});


test("LEVEL X first-party playback analytics use real playback heartbeats",()=>{
  const script=match?.[1]||"";
  assert.match(script,/ANALYTICS_REPORT_MS\s*=\s*15000/);
  assert.match(script,/\/api\/crown\/player\/playback/);
  assert.match(script,/startPlaybackAnalytics\(mediaId\)/);
  assert.match(script,/suspendPlaybackAnalytics\(mediaId/);
  assert.match(script,/activeMs/);
  assert.match(script,/durationMs/);
  assert.match(script,/pagehide/);
});


test("LEVEL X analytics control is grant-gated and threshold stays internal",()=>{
  const script=match?.[1]||"";
  assert.match(html,/id="analyticsLink"[^>]*hidden/);
  assert.match(script,/\/api\/crown\/player\/analytics-access/);
  assert.match(script,/d\?\.granted===true/);
  assert.doesNotMatch(html,/120 cumulative seconds|120-second|2:00 active playback/i);
});


test("LEVEL X keeps Tha X Filez out of Da CROWD Player",()=>{
  const script=match?.[1]||"";
  assert.doesNotMatch(html,/THA X FILEZ|Tha X Filez/i);
  assert.match(html,/Battle History/);
  assert.match(script,/collection_slug\|\|""/);
  assert.match(script,/!==["']tha-x-filez["']/);
  assert.match(script,/function accessTierLabel\(x\)/);
  assert.match(script,/PUBLIC FILE/);
  assert.match(script,/VAULT FILE/);
  assert.match(script,/queue-thumb/);
  assert.match(script,/thumbnail_url/);
});

test("LEVEL X renders verified event context and archive artifacts",()=>{
  const script=match?.[1]||"";
  assert.match(html,/id="eventContext"/);
  assert.match(script,/function renderEventContext\(item\)/);
  assert.match(script,/event\.display_name/);
  assert.match(script,/event\.event_date/);
  assert.match(script,/event\.artifacts/);
  assert.match(script,/EVENT CONTEXT \/\/ VERIFIED ARCHIVE/);
  assert.match(script,/SPACE \/ REPLAY/);
});

test("catalog event context is authorization-gated and schema-safe",()=>{
  assert.match(catalogService,/const hasEventContext=await eventSchemaReady\(db\)/);
  assert.match(catalogService,/hasEventContext\?eventContextMap\(db,artist\.id\):Promise\.resolve\(new Map\(\)\)/);
  assert.match(catalogService,/if\(item\.authorized\)\{[\s\S]*item\.event=events\.get\(Number\(item\.id\)\)\|\|null/);
  assert.match(catalogService,/else\{[\s\S]*item\.event=null/);
  assert.match(catalogService,/sqlite_master/);
  assert.doesNotMatch(catalogService,/evidence_note:event\.evidence_note/);
});


test("catalog media collections are schema-safe and attached before access sanitization",()=>{
  assert.match(catalogService,/async function collectionSchemaReady\(db\)/);
  assert.match(catalogService,/async function collectionContextMap\(db,artistId\)/);
  assert.match(catalogService,/const hasCollections=await collectionSchemaReady\(db\)/);
  assert.match(catalogService,/const collections=hasCollections\?await collectionContextMap\(db,artist\.id\):new Map\(\)/);
  assert.match(catalogService,/collection_slug:collection\?\.collection_slug\|\|null/);
  assert.match(catalogService,/const safe=resolveAndSanitizeMedia\(surfaceFiltered,viewer\)/);
});

test("catalog batches engagement and event context for large X archives",()=>{
  assert.match(catalogService,/async function engagementMap\(db,artistId\)/);
  assert.match(catalogService,/async function eventContextMap\(db,artistId\)/);
  assert.doesNotMatch(catalogService,/await engagement\(db,Number\(item\.id\)\)/);
  assert.doesNotMatch(catalogService,/await eventContext\(db,Number\(item\.id\)\)/);
});
