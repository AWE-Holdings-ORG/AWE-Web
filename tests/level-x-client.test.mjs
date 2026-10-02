import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

const LEVEL_X=fileURLToPath(new URL("../public/crown/crowd/level-x/index.html",import.meta.url));
const html=readFileSync(LEVEL_X,"utf8");
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
