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


test("LEVEL X does not invent a personal music lane for X",()=>{
  assert.doesNotMatch(html,/02\s*\/\/\s*LISTEN/i);
  assert.doesNotMatch(html,/<h3>Music<\/h3>/i);
  assert.match(html,/Photo Archive/);
  assert.match(html,/Behind the Scenes/);
  assert.match(html,/Flyers \+ Events/);
  assert.match(html,/From Da Vault/);
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
  assert.match(catalogService,/if\(item\.authorized\)\{[\s\S]*item\.event=hasEventContext\?await eventContext\(db,Number\(item\.id\)\):null/);
  assert.match(catalogService,/else\{[\s\S]*item\.event=null/);
  assert.match(catalogService,/sqlite_master/);
  assert.doesNotMatch(catalogService,/evidence_note:event\.evidence_note/);
});

